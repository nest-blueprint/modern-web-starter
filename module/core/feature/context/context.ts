import { SharedContext } from './type/shared-context.type';

export class Context {
  public static app;

  public static sharedContext: SharedContext = {
    user: {
      auth0UserId: undefined,
      userAccessToken: undefined,
    },
    requestBody: {
      createMentorProfile: undefined,
      createPricingPlan: undefined,
      createProfessionalExperience: undefined,
      createCustomerProfile: undefined,
      getMentor: undefined,
      getPricingPlan: undefined,
      getProfessionalExperience: undefined,
    },
    requestResponse: {
      createMentorProfile: undefined,
      createPricingPlan: undefined,
      createProfessionalExperience: undefined,
      createCustomerProfile: undefined,
      getMentor: undefined,
      getPricingPlan: undefined,
      getProfessionalExperience: undefined,
    },
    repositories: {
      user: undefined,
      mentor: undefined,
      person: undefined,
      skill: undefined,
      pricingPlan: undefined,
      professionalExperience: undefined,
      customer: undefined,
    },
    registered: {
      mentors: [],
    },
    services: {
      auth0: undefined,
    },
    resources: {
      userResource: undefined,
    },
  };

  public static clearAllData() {
    Context.app = undefined;

    Context.sharedContext.user.userAccessToken = undefined;
    Context.sharedContext.user.auth0UserId = undefined;

    Context.sharedContext.requestBody.createCustomerProfile = undefined;
    Context.sharedContext.requestResponse.createCustomerProfile = undefined;

    Context.sharedContext.requestBody.createMentorProfile = undefined;
    Context.sharedContext.requestResponse.createMentorProfile = undefined;

    Context.sharedContext.requestBody.createPricingPlan = undefined;
    Context.sharedContext.requestResponse.createPricingPlan = undefined;

    Context.sharedContext.requestBody.createProfessionalExperience = undefined;
    Context.sharedContext.requestResponse.createProfessionalExperience = undefined;

    Context.sharedContext.requestBody.getMentor = undefined;
    Context.sharedContext.requestResponse.getMentor = undefined;

    Context.sharedContext.requestBody.getPricingPlan = undefined;
    Context.sharedContext.requestResponse.getPricingPlan = undefined;

    Context.sharedContext.requestBody.getProfessionalExperience = undefined;
    Context.sharedContext.requestResponse.getProfessionalExperience = undefined;

    Context.sharedContext.resources.userResource = undefined;

    Context.sharedContext.registered.mentors = [];

    Context.sharedContext.services.auth0?.removeAllUsers();
    Context.sharedContext.services.auth0?.logOutAll();

    Context.sharedContext.repositories.user?.clear();
    Context.sharedContext.repositories.mentor?.clear();
    Context.sharedContext.repositories.customer?.clear();
    Context.sharedContext.repositories.skill?.clear();
    Context.sharedContext.repositories.pricingPlan?.clear();
    Context.sharedContext.repositories.professionalExperience?.clear();
    Context.sharedContext.repositories.person?.clear();
  }
}
