import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { IAccount } from 'sqrtledger-core';
import { Container } from '../core';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const container = await Container.get();

    if (req.method === 'DELETE') {
      await container.accountService.delete(req.params.reference);

      context.res = {
        body: true,
      };

      return;
    }

    if (req.method === 'GET') {
      const account: IAccount = await container.accountService.find(
        req.params.reference
      );

      context.res = {
        body: account,
      };

      return;
    }

    if (req.method === 'POST') {
      const account: IAccount = await container.accountService.create({
        availableBalance: 0,
        balance: 0,
        label: req.body.label,
        metadata: req.body.metadata,
        name: req.body.name,
        reference: req.params.reference,
        settings: {
          allowCreditTransactions: true,
          allowDebitTransactions: true,
          allowTransactions: true,
        },
        status: req.body.active ? 'active' : 'inactive',
      });

      context.res = {
        body: account,
      };

      return;
    }
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
