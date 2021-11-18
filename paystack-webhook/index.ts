import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { ICustomer } from 'sqrtledger-core';
import { Container } from '../core';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const container = await Container.get();

    if (!container) {
      context.res = {
        status: 400,
      };

      return;
    }

    const body: {
      data: {
        amount: number;
        authorization: {
          authorization_code: string;
          bin: string;
          exp_month: string;
          exp_year: string;
          last4: string;
        };
        customer: {
          email: string;
        };
        metadata: { accountReference: string; tenantId: string };
        reference: string;
      };
      event: string;
    } = req.body;

    if (body.event !== 'charge.success') {
      context.res = {
        body: true,
      };

      return;
    }

    let customer: ICustomer | null = await container.customerService.find(
      body.data.customer.email,
      body.data.metadata.tenantId
    );

    if (customer) {
      // TODO
    } else {
      customer = {
        cards: [
          {
            authorizationCode: body.data.authorization.authorization_code,
            bankIdentificationNumber: body.data.authorization.bin,
            expirationMonth: body.data.authorization.exp_month,
            expirationYear: body.data.authorization.exp_year,
            last4Digits: body.data.authorization.last4,
          },
        ],
        emailAddress: body.data.customer.email,
        metadata: {},
        name: null,
      };
    }

    customer = await container.customerService.createOrUpdate(
      {
        cards: [
          {
            authorizationCode: body.data.authorization.authorization_code,
            bankIdentificationNumber: body.data.authorization.bin,
            expirationMonth: body.data.authorization.exp_month,
            expirationYear: body.data.authorization.exp_year,
            last4Digits: body.data.authorization.last4,
          },
        ],
        emailAddress: body.data.customer.email,
        metadata: {},
        name: null,
      },
      body.data.metadata.tenantId
    );

    await container.transactionService.createProcessComplete(
      body.data.metadata.accountReference,
      body.data.amount,
      {
        authorizationCode: body.data.authorization.authorization_code,
        bankIdentificationNumber: body.data.authorization.bin,
        expirationMonth: body.data.authorization.exp_month,
        expirationYear: body.data.authorization.exp_year,
        last4Digits: body.data.authorization.last4,
      },
      body.data.reference,
      customer
        ? {
            emailAddress: customer.emailAddress,
            metadata: customer.metadata,
            name: customer.name,
          }
        : null,
      body.data.metadata,
      body.data.reference,
      'credit'
    );

    context.res = {
      body: true,
    };
  } catch (error: any | unknown) {
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
