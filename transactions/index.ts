import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { Container } from '../core';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const container = await Container.get();

  try {
    const result = await container.transactionService.create(
      req.params.reference,
      req.body.amount,
      req.body.collectionReference,
      req.body.metadata,
      req.body.reference,
      req.body.type
    );

    context.res = {
      body: result.transaction,
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
