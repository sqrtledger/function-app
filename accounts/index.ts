import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { IAccount } from 'sqrtledger-core';
import { AccountPostValidator, Container } from '../core';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const container = await Container.get();

    if (!req.headers['authorization']) {
      context.log('FALSE 1');
    }

    const valueSplitted: Array<string> =
      req.headers['authorization'].split(' ');

    context.log(JSON.stringify(valueSplitted));

    if (
      valueSplitted.length !== 2 ||
      valueSplitted[0].toLowerCase() !== 'basic'
    ) {
      context.log('FALSE 2');
    }

    if (
      container.credentialsService.validateAuthorizationHeader(
        req.headers['authorization']
      )
    ) {
      context.res = {
        body: {
          message: 'Unauthorized',
        },
        status: 401,
      };

      return;
    }

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
      AccountPostValidator.validate(req.body, req.params);

      const account: IAccount = await container.accountService.create({
        availableBalance: 0,
        balance: 0,
        label: req.body.label,
        metadata: req.body.metadata,
        name: req.body.name,
        reference: req.params.reference,
        settings: {
          allowCreditTransactions: req.body.settings.allowCreditTransactions,
          allowDebitTransactions: req.body.settings.allowDebitTransactions,
          allowTransactions: req.body.settings.allowTransactions,
        },
        status: req.body.active ? 'active' : 'inactive',
      });

      context.res = {
        body: account,
      };

      return;
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
