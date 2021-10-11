import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import * as MongoDb from 'mongodb';
import { IAccountRepository, MongoDbAccountRepository } from 'sqrtledger-core';

let mongoClient: MongoDb.MongoClient | null = null;

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  if (!mongoClient) {
    mongoClient = await MongoDb.MongoClient.connect(
      process.env.CONNECTION_STRING
    );
  }

  const db: MongoDb.Db = mongoClient.db('sqrtledger');

  const collectionAccounts: MongoDb.Collection = db.collection('accounts');

  const accountRepository: IAccountRepository = new MongoDbAccountRepository(
    collectionAccounts
  );

  try {
    const result = await accountRepository.create({
      availableBalance: 0,
      balance: 0,
      label: req.body.label,
      metadata: req.body.metadata,
      name: req.body.name,
      reference: req.params.accountReference,
      settings: {
        allowCreditTransactions: true,
        allowDebitTransactions: true,
        allowTransactions: true,
      },
      status: req.body.active ? 'active' : 'inactive',
    });

    context.res = {
      body: result,
    };
  } catch (error) {
    context.res = {
      status: 400,
      body: {
        message: error.message,
      },
    };
  }
};

export default httpTrigger;
