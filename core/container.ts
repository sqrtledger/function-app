import * as MongoDb from 'mongodb';
import {
  AccountService,
  CustomerService,
  IAccountRepository,
  ICustomerRepository,
  ITransactionRepository,
  MongoDbAccountRepository,
  MongoDbCustomerRepository,
  MongoDbTransactionRepository,
  TransactionService,
} from 'sqrtledger-core';
import { CredentialsService } from './services';

export class Container {
  protected static instance: {
    accountRepository: IAccountRepository;
    accountService: AccountService;
    credentialsService: CredentialsService;
    customerService: CustomerService;
    transactionRepository: ITransactionRepository;
    transactionService: TransactionService;
  } | null = null;

  public static async get(): Promise<{
    accountRepository: IAccountRepository;
    accountService: AccountService;
    credentialsService: CredentialsService;
    customerService: CustomerService;
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

    const accountService: AccountService = new AccountService(
      accountRepository
    );

    const collectionCustomers: MongoDb.Collection = db.collection('customers');

    const customerRepository: ICustomerRepository =
      new MongoDbCustomerRepository(collectionCustomers);

    const customerService: CustomerService = new CustomerService(
      customerRepository
    );

    const transactionRepository: ITransactionRepository =
      new MongoDbTransactionRepository(collectionTransactions);

    const transactionService: TransactionService = new TransactionService(
      accountRepository,
      transactionRepository
    );

    Container.instance = {
      accountRepository,
      accountService,
      credentialsService: new CredentialsService('Zq2e]C6s}&-Q$JLY'),
      customerService,
      transactionRepository,
      transactionService,
    };

    return Container.instance;
  }
}
