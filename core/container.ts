import * as MongoDb from 'mongodb';
import {
  IAccountRepository,
  ITransactionRepository,
  MongoDbAccountRepository,
  MongoDbTransactionRepository,
  TransactionService,
} from 'sqrtledger-core';

export class Container {
  protected static instance: {
    accountRepository: IAccountRepository;
    transactionRepository: ITransactionRepository;
    transactionService: TransactionService;
  } | null = null;

  public static async get(): Promise<{
    accountRepository: IAccountRepository;
    transactionRepository: ITransactionRepository;
    transactionService: TransactionService;
  }> {
    if (Container.instance) {
      return Container.instance;
    }

    const mongoClient = await MongoDb.MongoClient.connect(
      process.env.CONNECTION_STRING
    );

    const db: MongoDb.Db = mongoClient.db('sqrt-ledger');

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

    Container.instance = {
      accountRepository,
      transactionRepository,
      transactionService,
    };

    return Container.instance;
  }
}
