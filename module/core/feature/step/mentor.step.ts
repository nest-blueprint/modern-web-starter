import { Context } from '../context/context';
import { binding, given, then, when } from 'cucumber-tsflow';
import { expect } from 'chai';
import request from 'supertest';
import { routesV1 } from '../../config/routes-v1';
import { DataTable } from '@cucumber/cucumber';
import { Mentor } from '../../src/domain/mentor';
import { Language } from '../../src/domain/language';
import { support } from '../support/get-mentor-feature.support';
import { Id as SkillId } from '../../src/domain/skill/id';
import { Skill } from '../../src/domain/skill';
import { Id as PersonId } from '../../src/domain/person/id';
import { PhoneNumber } from '../../src/domain/person/phone-number';
import { Id as UserId } from '../../src/domain/user/id';
import { Person } from '../../src/domain/person';
import { Datetime } from '../../src/infrastructure/type/datetime.type';
import { Id as MentorId } from '../../src/domain/mentor/id';
import { Availability } from '../../src/domain/mentor/availability';
import { Type as TrainingType } from '../../src/domain/training/type';
import { MentorSettings } from '../../src/domain/mentor-settings';
import { Id as PricingPlanId } from '../../src/domain/pricing-plan/id';
import { Money } from '../../src/domain/money';
import { Type as PricingType } from '../../src/domain/pricing/type';
import { PricingPlan } from '../../src/domain/pricing-plan';
import { Id as ProfessionalExperienceId } from '../../src/domain/professional-experience/id';
import { Period } from '../../src/domain/professional-experience/period';
import { ProfessionalExperience } from '../../src/domain/professional-experience';
import { Email } from '../../src/domain/user/email';
import { User } from '../../src/domain/user';
import { Type as UserType } from '../../src/domain/user/type';
import { Auth0UserId } from '../../src/infrastructure/resource/auth0/type/auth0-user-id';
import { randomBetween } from '../../test/double/provider/external/auth0/util/auth0.util';
import { InMemoryUserResource } from '../../test/double/provider/external/auth0/authorization/resource/in-memory-user-resource';
import { UserRole as Auth0UserRole } from '../../src/infrastructure/resource/auth0/roles';
import { SharedContext } from '../context/type/shared-context.type';
import { Currency } from '../../src/domain/currency';
import { CurrencyCode } from '../../src/domain/currency-code';
import { Amount } from '../../src/infrastructure/type/money/amount';
@binding([Context])
export class MentorStep {
  private sharedContext: SharedContext;
  constructor(protected context: Context) {
    this.sharedContext = Context.sharedContext;
  }

  @given(/^the mentor is registered$/)
  async mentorIsRegistered() {
    expect(this.sharedContext.requestResponse.createMentorProfile.status).to.equal(201);
    const mentor = this.sharedContext.requestResponse.createMentorProfile.body;

    const mentorId = new MentorId(mentor.id);

    const mentorRegisteredObjectResult = this.sharedContext.repositories.mentor.get(mentorId);
    if (mentorRegisteredObjectResult.isErr()) {
      throw new Error('unexpected error. Mentor not found, but it should be');
    }
    this.sharedContext.registered.mentors.push(mentorRegisteredObjectResult.value);
  }

  @given(/^a user with email "([^"]*)", with an auth0 account created,a future mentor$/)
  createOrAccessWithAuth0UserAccountFutureMentor(email: string) {
    const auth0UserId = new Auth0UserId(`auth0|${randomBetween(10000000, 99999999)}`);
    const emailObject = Email.fromString(email);
    const userId = UserId.create();
    const userType = UserType.fromString(UserType.Mentor);
    const user = User.create(userId, emailObject, userType);

    // Add user to auth0 stub (fake auth0 service). It is now possible to log in with this user
    this.sharedContext.services.auth0.addUser(auth0UserId, user);

    // Also, we need add user in the Auth0Management stub service (UserResource), because it is used to match the user with the application account and check roles

    const userResource = Context.sharedContext.resources.userResource as InMemoryUserResource;
    userResource.users.set(auth0UserId.value, { user, role: Auth0UserRole.mentor });
    return { user, auth0UserId };
  }

  @given(/^a successfully registered user with email "([^"]*)", with a mentor profile created$/)
  async setupAMentorProfileWithProfileReady(email: string) {
    const wrappedUser = this.createOrAccessWithAuth0UserAccountFutureMentor(email);
    const { user } = this.createApplicationAccount(wrappedUser.user);
    const { mentor } = this.createMentorProfile(user);
    this.sharedContext.registered.mentors.push(mentor);
  }

  createApplicationAccount(user: User) {
    const emailObject = Email.fromString(user.email.value);
    const userFromAuth0 = Context.sharedContext.services.auth0.getUserByEmail(emailObject);

    const typeObject = UserType.fromString(UserType.Mentor);

    // Create person
    const personId = PersonId.create();
    const phoneNumber = PhoneNumber.fromString('+33666666666');
    const person = new Person(personId, userFromAuth0.user.id, 'John', 'Doe', phoneNumber, 'John', null, null, null);

    const newUser = new User(new UserId(user.id.value), emailObject, typeObject, person);

    const addUserResult = this.sharedContext.repositories.user.add(newUser, userFromAuth0.auth0UserId);
    const addPersonResult = this.sharedContext.repositories.person.add(person);

    if (addUserResult.isErr() || addPersonResult.isErr()) {
      throw new Error('Failed to create user or person');
    }
    return { user: newUser, person };
  }

  createMentorProfile(user: User) {
    const mentorId = MentorId.create();

    // Create mentor

    const description = "I'm a mentor";
    const availability = Availability.fromString(Availability.ExtraTime);
    const languages = [Language.fromString(Language.French), new Language(Language.English)];
    const trainingTypes = [
      TrainingType.fromString(TrainingType.Remote),
      TrainingType.fromString(TrainingType.FaceToFace),
    ];

    const skills = [Skill.create('javascript'), Skill.create('php')];

    const mentorSettings = new MentorSettings(mentorId, true, true, true, true, true, false, true);

    // Create pricing plans
    const pricingPlanId1 = PricingPlanId.create();
    const currency = Currency.fromString(CurrencyCode.EUR);
    const amount = new Amount(100);
    const rate = new Money(amount, currency);
    const trainingType = TrainingType.fromString(TrainingType.FaceToFace);
    const pricingType = PricingType.fromString(PricingType.Hourly);
    const title = 'Face to face (1h)';

    const pricingPlanId2 = PricingPlanId.create();
    const currency2 = Currency.fromString(CurrencyCode.EUR);
    const amount2 = new Amount(50);
    const rate2 = new Money(amount2, currency2);
    const trainingType2 = TrainingType.fromString(TrainingType.Remote);
    const pricingType2 = PricingType.fromString(PricingType.Hourly);
    const title2 = 'Remote (1h)';

    const pricingPlan1 = new PricingPlan(pricingPlanId1, mentorId, rate, trainingType, pricingType, title);
    const pricingPlan2 = new PricingPlan(pricingPlanId2, mentorId, rate2, trainingType2, pricingType2, title2);

    // Create professional experiences

    // Create professional professional-experience
    const professionalExperienceId1 = ProfessionalExperienceId.create();

    const startDate = new Date(2020, 0, 1);
    const endDate = new Date(2022, 6, 15);
    const company = 'SuperCompany';
    const jobTitle = 'Web Developer';
    const period = Period.fromString(startDate.toISOString(), endDate.toISOString(), 'month');

    // Create professional professional-experience
    const professionalExperienceId2 = ProfessionalExperienceId.create();

    const startDate2 = new Date(2016, 0, 1);
    const endDate2 = new Date(2017, 6, 15);
    const company2 = 'SuperCompany2';
    const jobTitle2 = 'Web Developer';
    const period2 = Period.fromString(startDate2.toISOString(), endDate2.toISOString(), 'month');

    const professionalExperience = new ProfessionalExperience(
      professionalExperienceId1,
      jobTitle,
      company,
      period,
      mentorId,
    );

    const professionalExperience2 = new ProfessionalExperience(
      professionalExperienceId2,
      jobTitle2,
      company2,
      period2,
      mentorId,
    );

    // Create mentor

    const mentor = new Mentor(
      mentorId,
      user,
      description,
      availability,
      languages,
      trainingTypes,
      mentorSettings,
      skills,
      [professionalExperience, professionalExperience2],
      [pricingPlan1, pricingPlan2],
      'Developer',
      'Developer',
    );

    const mentorAddResult = this.sharedContext.repositories.mentor.add(mentor);

    const pricingPlanAddResults = [pricingPlan1, pricingPlan2].map((pricingPlan) =>
      this.sharedContext.repositories.pricingPlan.add(pricingPlan),
    );

    const professionalExperienceAddResults = [professionalExperience, professionalExperience2].map(
      (professionalExperience) => this.sharedContext.repositories.professionalExperience.add(professionalExperience),
    );

    if (mentorAddResult.isErr()) {
      throw new Error('Failed to create mentor');
    }

    if (pricingPlanAddResults.some((result) => result.isErr())) {
      throw new Error('Failed to create pricing plan');
    }

    if (professionalExperienceAddResults.some((result) => result.isErr())) {
      throw new Error('Failed to create professional experience');
    }

    skills.forEach((skill) => {
      const skillAddResult = this.sharedContext.repositories.skill.add(skill);
      if (skillAddResult.isErr()) {
        throw new Error('Failed to create skill');
      }
    });

    return { mentor, skills };
  }

  loadSkillsInRepositoryFromSupport() {
    support.data.skills.forEach((skill) => {
      const skillId = new SkillId(skill.skill_id);
      const skillDomainObject = new Skill(skillId, skill.name);
      this.sharedContext.repositories.skill.add(skillDomainObject);
    });
  }

  createUserObjectFromSupport(user: { user_id: string; email: string; created_at: string }, person: Person) {
    const userId = new UserId(user.user_id);
    const email = Email.fromString(user.email);
    const userType = new UserType(UserType.Mentor);
    return new User(userId, email, userType, person);
  }

  createPersonObjectFromSupport(person: {
    person_id: string;
    user_id: string;
    firstname: string;
    lastname: string;
    phone_number: string;
    profile_photo: string;
  }) {
    const personId = new PersonId(person.person_id);
    const firstName = person.firstname;
    const lastName = person.lastname;
    const phoneNumber = PhoneNumber.fromString(person.phone_number);
    //const profilePhoto = person.profile_photo;
    const userId = new UserId(person.user_id);

    return new Person(
      personId,
      userId,
      firstName,
      lastName,
      phoneNumber,
      null,
      null,
      null,
      //profilePhoto,
    );
  }

  createMentorSettingsObjectFromSupport(
    mentorSettings: {
      mentor_id: string;
      display_nickname: number;
      display_profile_photo: number;
      display_location: number;
      display_email: number;
      display_phone_number: number;
      display_linkedin: number;
      display_current_job_title: number;
    },
    mentorId: MentorId,
  ) {
    const displayNickname = mentorSettings.display_nickname === 1;
    const displayProfilePhoto = mentorSettings.display_profile_photo === 1;
    const displayLocation = mentorSettings.display_location === 1;
    const displayEmail = mentorSettings.display_email === 1;
    const displayPhoneNumber = mentorSettings.display_phone_number === 1;
    const displayLinkedin = mentorSettings.display_linkedin === 1;
    const displayCurrentJobTitle = mentorSettings.display_current_job_title === 1;

    return new MentorSettings(
      mentorId,
      displayNickname,
      displayProfilePhoto,
      displayLocation,
      displayEmail,
      displayPhoneNumber,
      displayLinkedin,
      displayCurrentJobTitle,
    );
  }

  createPricingPlanObjectFromSupport(pricingPlan: {
    pricing_plan_id: string;
    mentor_id: string;
    price_amount: number;
    price_currency: string;
    training_type: string;
    pricing_type: string;
    title: string;
  }) {
    const pricingPlanId = new PricingPlanId(pricingPlan.pricing_plan_id);
    const mentorId = new MentorId(pricingPlan.mentor_id);
    const price = Money.fromStringValues(pricingPlan.price_amount, pricingPlan.price_currency);
    const trainingType = TrainingType.fromString(pricingPlan.training_type);
    const pricingType = PricingType.fromString(pricingPlan.pricing_type);
    const title = pricingPlan.title;

    return new PricingPlan(pricingPlanId, mentorId, price, trainingType, pricingType, title);
  }

  createProfessionalExperienceObjectFromSupport(experience: {
    professional_experience_id: string;
    mentor_id: string;
    company: string;
    job_title: string;
    start_date: string;
    end_date: string;
  }) {
    const id = new ProfessionalExperienceId(experience.professional_experience_id);
    const mentorId = new MentorId(experience.mentor_id);
    const company = experience.company;
    const jobTitle = experience.job_title;
    const startDate = Datetime.buildDateTimeBasedOnUnit(experience.start_date, 'month');
    const endDate = Datetime.buildDateTimeBasedOnUnit(experience.end_date, 'month');
    const period = Period.fromDateTimes(startDate, endDate, 'month');
    return new ProfessionalExperience(id, jobTitle, company, period, mentorId);
  }

  valueObjectsFromMentorSupport(mentor: {
    mentor_id: string;
    profile_title: string;
    profile_description: string;
    current_job: string;
    availability: string;
    languages: string;
    training_type: string;
    user_id: string;
  }) {
    const mentorId = new MentorId(mentor.mentor_id);
    const profileTitle = mentor.profile_title;
    const profileDescription = mentor.profile_description;
    const currentJob = mentor.current_job;
    const availability = Availability.fromString(mentor.availability);
    const trainingType = mentor.training_type.split(',').map((trainingType) => TrainingType.fromString(trainingType));
    const languages = mentor.languages.split(',').map((language) => Language.fromString(language));

    return {
      mentorId,
      profileTitle,
      profileDescription,
      currentJob,
      availability,
      trainingType,
      languages,
    };
  }

  findLinkedUser(person: Person) {
    const user = support.data.users.find((user) => user.user_id === person.userId.value);

    if (!user) {
      throw new Error('Cannot load data in in-memory repositories. Failed to match person and user.');
    }

    return user;
  }

  findLinkedMentor(person: Person) {
    const mentor = support.data.mentors.find((mentor) => mentor.user_id === person.userId.value);

    if (!mentor) {
      throw new Error('Cannot load data in in-memory repositories. Failed to match person and mentor.');
    }

    return mentor;
  }

  findLinkedMentorSettings(mentorId: MentorId) {
    const mentorSettings = support.data.mentorProfileSettings.find((settings) => settings.mentor_id === mentorId.value);

    if (!mentorSettings) {
      throw new Error('Cannot load data in in-memory repositories. Failed to match mentor and mentor settings.');
    }

    return mentorSettings;
  }

  findLinkedMentorPricingPlans(mentorId: MentorId) {
    return support.data.mentorPricingPlans.filter((pricingPlan) => pricingPlan.mentor_id === mentorId.value);
  }

  findLinkedMentorProfessionalExperiences(mentorId: MentorId) {
    return support.data.mentorProfessionalExperiences.filter((experience) => experience.mentor_id === mentorId.value);
  }

  findLinkedMentorSkills(mentorId: MentorId) {
    return support.data.mentorSkills.filter((skill) => skill.mentor_id === mentorId.value);
  }

  retrieveMentorSkills(mentorId: MentorId, mentorSkills: { skill_id: string; mentor_id: string }[]) {
    const skills: Skill[] = [];
    mentorSkills.forEach((skill) => {
      const skillDomainObject = this.sharedContext.repositories.skill.get(new SkillId(skill.skill_id));
      if (skillDomainObject.isErr()) {
        throw new Error('Cannot load data in in-memory repositories. Failed to match mentor and skill.');
      }
      skills.push(skillDomainObject.value);
    });
    return skills;
  }

  @given(/^a list of mentors registered in the application$/)
  async addMentorsToApplication() {
    this.loadSkillsInRepositoryFromSupport();

    support.data.persons.forEach((person) => {
      const personDomainObject = this.createPersonObjectFromSupport(person);

      const user = this.findLinkedUser(personDomainObject);
      const userDomainObject = this.createUserObjectFromSupport(user, personDomainObject);

      const mentor = this.findLinkedMentor(personDomainObject);
      const mentorId = new MentorId(mentor.mentor_id);
      const mentorSettings = this.findLinkedMentorSettings(mentorId);

      const pricingPlans = this.findLinkedMentorPricingPlans(mentorId);

      const pricingPlanDomainObjects = pricingPlans.map((pricingPlan) =>
        this.createPricingPlanObjectFromSupport(pricingPlan),
      );

      const professionalExperiences = this.findLinkedMentorProfessionalExperiences(mentorId);

      const professionalExperienceDomainObjects = professionalExperiences.map((experience) =>
        this.createProfessionalExperienceObjectFromSupport(experience),
      );

      const mentorSkillsSupport = this.findLinkedMentorSkills(mentorId);

      const mentorSkills = this.retrieveMentorSkills(mentorId, mentorSkillsSupport);

      const mentorSettingsDomainObject = this.createMentorSettingsObjectFromSupport(mentorSettings, mentorId);

      const { profileTitle, profileDescription, currentJob, availability, trainingType, languages } =
        this.valueObjectsFromMentorSupport(mentor);

      const mentorDomainObject = new Mentor(
        mentorId,
        userDomainObject,
        profileDescription,
        availability,
        languages,
        trainingType,
        mentorSettingsDomainObject,
        mentorSkills,
        professionalExperienceDomainObjects,
        pricingPlanDomainObjects,
        currentJob,
        profileTitle,
      );

      const auth0UserId = new Auth0UserId(`auth0|${randomBetween(1000000000, 9999999999)}`);

      const results = [
        this.sharedContext.repositories.user.add(userDomainObject, auth0UserId),
        this.sharedContext.repositories.person.add(personDomainObject),
        this.sharedContext.repositories.mentor.add(mentorDomainObject),
        this.sharedContext.repositories.skill.setMentorSkills(mentorId, mentorSkills),
      ];

      if (results.some((result) => result.isErr())) {
        const error = results.find((result) => result.isErr())._unsafeUnwrapErr();
        throw new Error(`Cannot load data in in-memory repository : ${error.name} - ${error.message}`);
      }

      this.sharedContext.registered.mentors.push(mentorDomainObject);
    });
  }

  @when(/^I create a mentor profile for the user, using default profile settings with these details:$/)
  async createMentorRequest(data: DataTable) {
    const rawData = Object.fromEntries(data.transpose().raw());

    rawData['languages'] = rawData['languages']
      .split(',')
      .filter((element) => element.length !== 0)
      .map((l) => ({
        language: l.trim().toLowerCase(),
      }));

    if (rawData['languages'].length === 0) {
      rawData['languages'] = [];
    }

    rawData['skills'] = rawData['skills'].split(',');

    // Case if there's no skills provided
    if (rawData['skills'].length === 1 && rawData['skills'][0] === '') {
      rawData['skills'] = [];
    }

    const parseToBoolean = (value: string) => {
      return value === 'true';
    };

    rawData['display_nickname'] = parseToBoolean(rawData['display_nickname']);
    rawData['display_phone_number'] = parseToBoolean(rawData['display_phone_number']);
    rawData['display_email'] = parseToBoolean(rawData['display_email']);
    rawData['display_linkedin'] = parseToBoolean(rawData['display_linkedin']);
    rawData['display_location'] = parseToBoolean(rawData['display_location']);
    rawData['display_current_job_title'] = parseToBoolean(rawData['display_current_job_title']);
    rawData['display_profile_photo'] = parseToBoolean(rawData['display_profile_photo']);

    rawData['experience_ids'] = [];
    rawData['pricing_plan_ids'] = [];

    rawData['course_type'] = rawData['course_type'].split(',');

    rawData['firstname'] = rawData['firstname'] === '' ? undefined : rawData['firstname'];
    rawData['lastname'] = rawData['lastname'] === '' ? undefined : rawData['lastname'];

    this.sharedContext.requestBody.createMentorProfile = rawData;

    if (this.sharedContext.user.userAccessToken) {
      this.sharedContext.requestResponse.createMentorProfile = await request(Context.app.getHttpServer())
        .post(routesV1.mentor.register)
        .set('Authorization', `Bearer ${this.sharedContext.user.userAccessToken}`)
        .send(this.sharedContext.requestBody.createMentorProfile);
      return;
    }

    this.sharedContext.requestResponse.createMentorProfile = await request(Context.app.getHttpServer())
      .post(routesV1.mentor.register)
      .send(this.sharedContext.requestBody.createMentorProfile);
  }

  @when(/^I search for a mentor$/)
  async searchForMentors() {
    this.sharedContext.requestResponse.getMentor = await request(Context.app.getHttpServer()).get(routesV1.mentor.get);
  }

  @when(/^I search for a mentor and sort them by price descending$/)
  async searchForMentorsAndSortByPriceDescending() {
    this.sharedContext.requestResponse.getMentor = await request(Context.app.getHttpServer())
      .get(routesV1.mentor.get)
      .query({ price: 'desc' });
  }

  @when(/^I search for a mentor with pricing plans between "([^"]*)" and "([^"]*)"$/)
  async searchForMentorsWithPricingPlansBetween(min: string, max: string) {
    const price_min = parseInt(min);
    const price_max = parseInt(max);

    this.sharedContext.requestResponse.getMentor = await request(Context.app.getHttpServer())
      .get(routesV1.mentor.get)
      .query({ price_min, price_max });
  }

  @when(/^I search for a mentor with pricing type "([^"]*)"$/)
  async searchForMentorsWithPricingType(type: string) {
    this.sharedContext.requestResponse.getMentor = await request(Context.app.getHttpServer())
      .get(routesV1.mentor.get)
      .query({ pricing_type: type });
  }

  @when(/^I search for a mentor with specializations "([^"]*)" and "([^"]*)"$/)
  async searchForMentorsWithSpecializations(specialization1: string, specialization2: string) {
    const specializations = [specialization1, specialization2];
    this.sharedContext.requestResponse.getMentor = await request(Context.app.getHttpServer())
      .get(routesV1.mentor.get)
      .query({ specializations });
  }

  @when(/^I search for a mentor who speaks "([^"]*)"$/)
  async searchForMentorsWhoSpeakw(language: string) {
    this.sharedContext.requestResponse.getMentor = await request(Context.app.getHttpServer())
      .get(routesV1.mentor.get)
      .query({ languages: ['fr'] })
      .send();
  }

  @when(/^I search for a mentor with availability "([^"]*)"$/)
  async searchForMentorsWithAvailability(availability: string) {
    this.sharedContext.requestResponse.getMentor = await request(Context.app.getHttpServer())
      .get(routesV1.mentor.get)
      .query({ mentor_availability: availability });
  }

  @when(/^I search for a mentor with price order "([^"]*)"$/)
  async searchForMentorsWithPriceOrder(priceOrder: string) {
    this.sharedContext.requestResponse.getMentor = await request(Context.app.getHttpServer())
      .get(routesV1.mentor.get)
      .query({ price_order: priceOrder });
  }

  @when(/^I search for a mentor with training type "([^"]*)"$/)
  async searchForMentorsWithTrainingType(trainingType: string) {
    this.sharedContext.requestResponse.getMentor = await request(Context.app.getHttpServer())
      .get(routesV1.mentor.get)
      .query({ training_type: trainingType });
  }

  @then(/^the mentor profile is successfully saved$/)
  async mentorProfileCreated() {
    expect(this.sharedContext.requestResponse.createMentorProfile.status).to.equal(201);
    const mentor = this.sharedContext.requestResponse.createMentorProfile.body;

    const mentorId = new MentorId(mentor.id);

    const mentorRegisteredObjectResult = this.sharedContext.repositories.mentor.get(mentorId);
    if (mentorRegisteredObjectResult.isErr()) {
      throw new Error('unexpected error. Mentor not found, but it should be');
    }

    this.sharedContext.registered.mentors.push(mentorRegisteredObjectResult.value);
  }

  @then(/^the mentor profile is not created, because the user is not found$/)
  async mentorProfileNotCreated() {
    expect(this.sharedContext.requestResponse.createMentorProfile.status).to.equal(404);
  }

  @then(/^the mentor profile is not created, because the skills are not provided$/)
  async mentorProfileNotCreatedBecauseSkillsNotProvided() {
    expect(this.sharedContext.requestResponse.createMentorProfile.status).to.equal(400);
  }

  @then(/^the mentor profile is not created, because the languages are not provided$/)
  async mentorProfileNotCreatedBecauseLanguagesNotProvided() {
    expect(this.sharedContext.requestResponse.createMentorProfile.status).to.equal(400);
  }

  @then(/^the mentor profile is not created, because the availability type is not provided$/)
  async mentorProfileNotCreatedBecauseAvailabilityTypeNotProvided() {
    expect(this.sharedContext.requestResponse.createMentorProfile.status).to.equal(400);
  }

  @then(
    /^the mentor profile is not created, because at least one of some required fields has to be displayed on his profile$/,
  )
  async mentorProfileNotCreatedBecauseFirstnameOrLastnameOrNicknameNotProvided() {
    expect(this.sharedContext.requestResponse.createMentorProfile.status).to.equal(400);
  }

  @then(/^the mentor profile is not created, the user is not logged in$/)
  async mentorNotCreatedBecauseUserIsNotLoggedIn() {
    expect(this.sharedContext.requestResponse.createMentorProfile.status).to.be.equal(401);
  }

  @then(/^the mentor profile is not created, the user already has a mentor profile$/)
  async mentorNotCreatedBecauseUserAlreadyHasAMentorProfile() {
    expect(this.sharedContext.requestResponse.createMentorProfile.status).to.be.equal(409);
  }

  @then(/^the mentor profile is not created, because a customer profile already exists for the user$/)
  async mentorNotCreatedBecauseCustomerProfileAlreadyExists() {
    expect(this.sharedContext.requestResponse.createMentorProfile.status).to.be.equal(409);
  }
  @then(/^I should get a list of "([^"]*)" mentors$/)
  async retrieveMentors(mentors: string) {
    const expectedMentors = parseInt(mentors);
    expect(this.sharedContext.requestResponse.getMentor.status).to.equal(200);
    expect(this.sharedContext.requestResponse.getMentor.body).to.have.length(expectedMentors);
  }

  @then(/^I should get a list of mentors that have specializations "([^"]*)" and "([^"]*)"$/)
  async retrieveMentorsWithSpecializations(specialization1: string, specialization2: string) {
    expect(this.sharedContext.requestResponse.getMentor.status).to.equal(200);

    const mentorsFromResponse = this.sharedContext.requestResponse.getMentor.body;

    const mentors = this.sharedContext.registered.mentors;

    const mentorsWithSpecializations = mentors.filter((mentor: Mentor) => {
      const mentorSkills = mentor.skills.map((specialization) => specialization.name);
      const skills = [specialization1, specialization2];
      return skills.every((skill) => mentorSkills.includes(skill));
    });

    expect(mentorsFromResponse).to.have.length(mentorsWithSpecializations.length);
  }

  @then(/^I should get a list of mentors that can speak "([^"]*)"$/)
  async retrieveMentorsWithLanguages(language: string) {
    const languageDomainObject = Language.fromString('fr');

    const mentorsFromResponse = this.sharedContext.requestResponse.getMentor.body;

    expect(this.sharedContext.requestResponse.getMentor.status).to.equal(200);

    const mentors = this.sharedContext.registered.mentors;

    const mentorsWithLanguages = mentors.filter((mentor: Mentor) => {
      const languages = mentor.languages.map((language) => language.value);
      return languages.includes(languageDomainObject.value);
    });

    expect(mentorsFromResponse).to.have.length(mentorsWithLanguages.length);
  }

  @then(/^I should get a list of mentors that have set their availability to "([^"]*)"$/)
  async retrieveMentorsWithAvailability(availability: string) {
    expect(this.sharedContext.requestResponse.getMentor.status).to.equal(200);

    const mentors = this.sharedContext.registered.mentors;
    const mentorsWithAvailability = mentors.filter((mentor: Mentor) => mentor.availability.value === availability);

    expect(mentorsWithAvailability).to.have.length(this.sharedContext.requestResponse.getMentor.body.length);
  }

  @then(/^I should get a list of mentors that can teach "([^"]*)" courses$/)
  async retrieveMentorsWithCourses(courses: string) {
    expect(this.sharedContext.requestResponse.getMentor.status).to.equal(200);
  }

  @then(/^I should get a list of mentors that have pricing plans between "([^"]*)" and "([^"]*)"$/)
  async retrieveMentorsWithPricingPlans(min: string, max: string) {
    const priceMin = parseInt(min);
    const priceMax = parseInt(max);

    expect(this.sharedContext.requestResponse.getMentor.status).to.equal(200);

    const beforeTheRange = this.sharedContext.requestResponse.getMentor.body.filter(
      (mentor) => mentor.price_min < priceMin,
    );
    const afterTheRange = this.sharedContext.requestResponse.getMentor.body.filter(
      (mentor) => mentor.price_max > priceMax,
    );

    expect(beforeTheRange).to.have.length(0);
    expect(afterTheRange).to.have.length(0);
  }

  @then(/^I should get a list of mentors that have pricing plans with the pricing type set to "([^"]*)"$/)
  async retrieveMentorsWithPricingPlansOfType(type: string) {
    expect(this.sharedContext.requestResponse.getMentor.status).to.equal(200);

    const mentors = this.sharedContext.registered.mentors.filter((mentor: Mentor) => {
      const pricingPlans = mentor.pricingPlans.map((pricingPlan) => pricingPlan.pricingType.value.toString());
      return pricingPlans.includes(type);
    });

    expect(mentors).to.have.length(this.sharedContext.requestResponse.getMentor.body.length);
  }

  @then(/^I should get a list of mentors sorted by price descending$/)
  async retrieveMentorsSortedByPriceDescending() {
    expect(this.sharedContext.requestResponse.getMentor.status).to.equal(200);

    const mentors: Mentor[] = this.sharedContext.registered.mentors;
    const mentorsFromResponse = this.sharedContext.requestResponse.getMentor.body;

    mentors.sort((mentor1: Mentor, mentor2: Mentor) => {
      const pricePricingPlansA = mentor1.pricingPlans.map((pricingPlan) => pricingPlan.rate.amount.value);
      const pricePricingPlansB = mentor2.pricingPlans.map((pricingPlan) => pricingPlan.rate.amount.value);

      const minimumPriceA = Math.min(...pricePricingPlansA);
      const minimumPriceB = Math.min(...pricePricingPlansB);

      return minimumPriceB - minimumPriceA;
    });

    const mentorsIdFromRegisteredMentors = mentors.map((mentor) => mentor.id.value);
    const mentorsIdFromResponse = mentorsFromResponse.map((mentor) => mentor.id);

    expect(mentorsIdFromRegisteredMentors).to.deep.equal(mentorsIdFromResponse);
  }
}
