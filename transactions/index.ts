import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import * as MongoDb from 'mongodb';
import {
  IAccountRepository,
  ITransactionRepository,
  MongoDbAccountRepository,
  MongoDbTransactionRepository,
  TransactionService,
} from 'sqrtledger-core';

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

  const collectionTransactions: MongoDb.Collection =
    db.collection('transactions');

  const accountRepository: IAccountRepository = new MongoDbAccountRepository(
    collectionAccounts
  );

  const transactionRepository: ITransactionRepository =
    new MongoDbTransactionRepository(collectionTransactions);

  const transactionService: TransactionService = new TransactionService(
    accountRepository,
    transactionRepository
  );

  try {
    const result = await transactionService.create(
      req.params.accountReference,
      req.body.amount,
      req.body.collectionReference,
      req.body.metadata,
      req.body.reference,
      req.body.type
    );

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
