import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import {
  IAccountRepository,
  InMemoryAccountRepository,
  InMemoryTransactionRepository,
  ITransactionRepository,
  TransactionService,
} from 'sqrtledger-core';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const accountRepository: IAccountRepository = new InMemoryAccountRepository();

  const transactionRepository: ITransactionRepository =
    new InMemoryTransactionRepository();

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
      // status: 200, /* Defaults to 200 */
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
