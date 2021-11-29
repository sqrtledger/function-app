import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { ICustomerView } from 'sqrtledger-core';
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

    const customers: Array<ICustomerView> =
      await container.customerService.findAll(req.params.reference, tenantId);

    context.res = {
      body: customers,
    };
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
