import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { ITransaction } from 'sqrtledger-core';
import { Container, AuthorizationHelper } from '../core';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const container = await Container.get();

    const tenantId: string | null = AuthorizationHelper.getSubFromHeader(
      req.headers['authorization']
    );

    if (!tenantId) {
      context.res = {
        body: {
          message: 'Unauthorized',
        },
        status: 401,
      };

      return;
    }

    if (req.method === 'GET') {
      const transactions: Array<ITransaction> =
        await container.transactionService.findAll(
          req.params.reference,
          tenantId
        );

      context.res = {
        body: transactions,
      };

      return;
    }

    if (req.method === 'POST') {
      if (req.body instanceof Object) {
        const result = await container.transactionService.createProcessComplete(
          req.params.reference,
          req.body.amount,
          req.body.card,
          req.body.collectionReference,
          req.body.customer,
          req.body.metadata,
          req.body.reference,
          req.body.type,
          tenantId
        );

        context.res = {
          body: result.transaction,
        };

        return;
      }
    }
  } catch (error) {
    context.log(`[ERROR]: ${error.message}`);

    context.res = {
      body: {
        message: error.message,
      },
      status: 500,
    };
  }
};

export default httpTrigger;
