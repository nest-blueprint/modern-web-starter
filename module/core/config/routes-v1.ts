const customerRoot = '/customer';
const mentorRoot = '/mentor';
const pricingPlanRoot = '/pricing_plan';
const professionalExperienceRoot = '/professional_experience';
const accountRoot = '/account';

export const routesV1 = {
  version: 'v1',
  customer: {
    root: customerRoot,
    register: customerRoot,
  },
  mentor: {
    root: mentorRoot,
    register: mentorRoot,
    get: mentorRoot,
  },
  pricing_plan: {
    root: pricingPlanRoot,
    create: pricingPlanRoot,
    get: pricingPlanRoot,
  },
  professional_experience: {
    root: professionalExperienceRoot,
    create: professionalExperienceRoot,
    get: professionalExperienceRoot,
  },
  accountData: {
    root: accountRoot,
    get: accountRoot,
    patch: accountRoot,
  },
};
