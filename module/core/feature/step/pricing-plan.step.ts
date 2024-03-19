import { binding, given, when, then } from 'cucumber-tsflow';
import { expect } from 'chai';
import { Context } from '../context/context';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { routesV1 } from '../../config/routes-v1';
import { DataTable } from '@cucumber/cucumber';
import { Id as PricingPlanId } from '../../src/domain/pricing-plan/id';
import { SharedContext } from '../context/type/shared-context.type';

@binding([Context])
export class PricingPlanStep {
  private sharedContext: SharedContext;
  constructor(protected context: Context) {
    this.sharedContext = Context.sharedContext;
  }

  @given(/^the pricing plan is registered$/)
  async pricingPlanIsRegistered() {
    expect(this.sharedContext.requestResponse.createPricingPlan.status).to.equal(201);

    const pricingPlanId = new PricingPlanId(this.sharedContext.requestResponse.createPricingPlan.body.id);
    const pricingPlanResult = this.sharedContext.repositories.pricingPlan.find(pricingPlanId);
    if (pricingPlanResult.isOk() && pricingPlanResult.value === null) {
      throw new Error('Pricing plan not found and it should be');
    }
  }

  @given(/^I create a pricing plan for the mentor with these details:$/)
  async createPricingPlan(data: DataTable) {
    const rawData = Object.fromEntries(data.transpose().raw());
    rawData['price_currency'] = { currency: rawData['price_currency'] };
    rawData['price_amount'] = Number(rawData['price_amount']);

    const body = rawData;

    this.sharedContext.requestBody.createPricingPlan = body;

    const mentor_id = this.sharedContext.registered.mentors[0].id.value ?? randomUUID();

    const accessToken = this.sharedContext.user.userAccessToken;

    if (accessToken) {
      this.sharedContext.requestResponse.createPricingPlan = await request(Context.app.getHttpServer())
        .post(routesV1.pricing_plan.root)
        .query({ mentor_id })
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body);
      return;
    }

    this.sharedContext.requestResponse.createPricingPlan = await request(Context.app.getHttpServer())
      .post(routesV1.pricing_plan.root)
      .query({ mentor_id })
      .send(body);
  }

  @when(/^I try to get the pricing plans from the mentor$/)
  async getPricingPlansFromMentor() {
    const mentor_id = this.sharedContext.registered.mentors[0].id.value ?? randomUUID();

    const ids = this.sharedContext.registered.mentors[0].pricingPlans.map((pricingPlan) => pricingPlan.id.value);

    this.sharedContext.requestResponse.getPricingPlan = await request(Context.app.getHttpServer())
      .get(routesV1.pricing_plan.root)
      .query({ mentor_id, ids });
  }

  @when(/^I try get a pricing plan from the mentor$/)
  async getAPricingPlanFromMentor() {
    const mentor_id =
      this.sharedContext.registered.mentors[0].id.value ?? this.sharedContext.requestBody.getMentor.body['id'];
    const ids = this.sharedContext.registered.mentors[0].pricingPlans.map((pricingPlan) => pricingPlan.id.value);
    const pricing_plan_id = ids[0];

    this.sharedContext.requestResponse.getPricingPlan = await request(Context.app.getHttpServer())
      .get(routesV1.pricing_plan.root)
      .query(`mentor_id=${mentor_id}&ids=${pricing_plan_id}`)
      .send();
  }

  @when(/^I try get the pricing plans for an unregistered mentor$/)
  async getPricingPlansForAnUnregisteredMentor() {
    const mentor_id = randomUUID();

    const ids = randomUUID();

    this.sharedContext.requestResponse.getPricingPlan = await request(Context.app.getHttpServer())
      .get(routesV1.pricing_plan.root)
      .query({ mentor_id, ids });
  }

  @when(/^I try get the pricing plans without providing identifiers$/)
  async getPricingPlansWithoutProvidingIdentifiers() {
    const mentor_id = this.sharedContext.registered.mentors[0].id.value
      ? this.sharedContext.requestResponse.getMentor?.body['id']
      : randomUUID();

    this.sharedContext.requestResponse.getPricingPlan = await request(Context.app.getHttpServer())
      .get(routesV1.pricing_plan.root)
      .query({ mentor_id, ids: '' });
  }

  @then(/^the pricing plan should not be created for the mentor$/)
  async pricingPlanCreationFailed() {
    expect(this.sharedContext.requestResponse.createPricingPlan.status).not.to.equal(201);
  }

  @then(/^I should get the pricing plan$/)
  async retrievePricingPlan() {
    expect(this.sharedContext.requestResponse.getPricingPlan.status).to.equal(200);
  }

  @then(/^I should get the two pricing plans$/)
  async retrieveMultiple() {
    expect(this.sharedContext.requestResponse.getPricingPlan.body).to.have.length(2);
  }

  @then(/^I should get an error about getting pricing plans$/)
  async retrieveError() {
    expect(this.sharedContext.requestResponse.getPricingPlan.status).to.be.above(399);
    expect(this.sharedContext.requestResponse.getPricingPlan.status).to.be.lessThan(500);
  }

  @then(/^the pricing plan should be created for the mentor$/)
  async pricingPlanIsCreated() {
    expect(this.sharedContext.requestResponse.createPricingPlan.status).to.equal(201);
  }
}
