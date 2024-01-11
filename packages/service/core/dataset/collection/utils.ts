import type { CollectionWithDatasetType } from '@fastgpt/global/core/dataset/type.d';
import { MongoDatasetCollection } from './schema';
import type { ParentTreePathItemType } from '@fastgpt/global/common/parentFolder/type.d';
import { splitText2Chunks } from '@fastgpt/global/common/string/textSplitter';
import { MongoDatasetTraining } from '../training/schema';
import { urlsFetch } from '../../../common/string/cheerio';
import { DatasetCollectionTypeEnum } from '@fastgpt/global/core/dataset/constant';
import { hashStr } from '@fastgpt/global/common/string/tools';

/**
 * get all collection by top collectionId
 */
export async function findCollectionAndChild(id: string, fields = '_id parentId name metadata') {
  async function find(id: string) {
    // find children
    const children = await MongoDatasetCollection.find({ parentId: id }, fields);

    let collections = children;

    for (const child of children) {
      const grandChildrenIds = await find(child._id);
      collections = collections.concat(grandChildrenIds);
    }

    return collections;
  }
  const [collection, childCollections] = await Promise.all([
    MongoDatasetCollection.findById(id, fields),
    find(id)
  ]);

  if (!collection) {
    return Promise.reject('Collection not found');
  }

  return [collection, ...childCollections];
}

export async function getDatasetCollectionPaths({
  parentId = ''
}: {
  parentId?: string;
}): Promise<ParentTreePathItemType[]> {
  async function find(parentId?: string): Promise<ParentTreePathItemType[]> {
    if (!parentId) {
      return [];
    }

    const parent = await MongoDatasetCollection.findOne({ _id: parentId }, 'name parentId');

    if (!parent) return [];

    const paths = await find(parent.parentId);
    paths.push({ parentId, parentName: parent.name });

    return paths;
  }

  return await find(parentId);
}

export function getCollectionUpdateTime({ name, time }: { time?: Date; name: string }) {
  if (time) return time;
  if (name.startsWith('手动') || ['manual', 'mark'].includes(name)) return new Date('2999/9/9');
  return new Date();
}

/**
 * Get collection raw text by Collection or collectionId
 */
export const getCollectionAndRawText = async ({
  collectionId,
  collection,
  newRawText
}: {
  collectionId?: string;
  collection?: CollectionWithDatasetType;
  newRawText?: string;
}) => {
  const col = await (async () => {
    if (collection) return collection;
    if (collectionId) {
      return (await MongoDatasetCollection.findById(collectionId).populate(
        'datasetId'
      )) as CollectionWithDatasetType;
    }

    return null;
  })();

  if (!col) {
    return Promise.reject('Collection not found');
  }

  const rawText = await (async () => {
    if (newRawText) return newRawText;
    // link
    if (col.type === DatasetCollectionTypeEnum.link && col.rawLink) {
      // crawl new data
      const result = await urlsFetch({
        urlList: [col.rawLink],
        selector: col.datasetId?.websiteConfig?.selector || col?.metadata?.webPageSelector
      });

      return result[0].content;
    }

    // file

    return '';
  })();

  const hashRawText = hashStr(rawText);
  const isSameRawText = col.hashRawText === hashRawText;

  return {
    collection: col,
    rawText,
    isSameRawText
  };
};

/* link collection start load data */
export const reloadCollectionChunks = async ({
  collectionId,
  collection,
  tmbId,
  billId,
  rawText
}: {
  collectionId?: string;
  collection?: CollectionWithDatasetType;
  tmbId: string;
  billId?: string;
  rawText?: string;
}) => {
  const {
    rawText: newRawText,
    collection: col,
    isSameRawText
  } = await getCollectionAndRawText({
    collection,
    collectionId,
    newRawText: rawText
  });

  if (isSameRawText) return;

  // split data
  const { chunks } = splitText2Chunks({
    text: newRawText,
    chunkLen: col.chunkSize || 512,
    countTokens: false
  });

  // insert to training queue
  await MongoDatasetTraining.insertMany(
    chunks.map((item, i) => ({
      teamId: col.teamId,
      tmbId,
      datasetId: col.datasetId._id,
      collectionId: col._id,
      billId,
      mode: col.trainingType,
      prompt: '',
      model: col.datasetId.vectorModel,
      q: item,
      a: '',
      chunkIndex: i
    }))
  );

  // update raw text
  await MongoDatasetCollection.findByIdAndUpdate(col._id, {
    rawTextLength: newRawText.length,
    hashRawText: hashStr(newRawText)
  });
};
