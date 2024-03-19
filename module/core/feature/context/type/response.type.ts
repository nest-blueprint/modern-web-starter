import supertest from 'supertest';

export type Response = {
  createMentorProfile: supertest.Response;
  createPricingPlan: supertest.Response;
  createProfessionalExperience: supertest.Response;
  createCustomerProfile: supertest.Response;
  getMentor: supertest.Response;
  getPricingPlan: supertest.Response;
  getProfessionalExperience: supertest.Response;
};
