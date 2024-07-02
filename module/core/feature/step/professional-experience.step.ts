import { binding, given, then, when } from 'cucumber-tsflow';
import { Context } from '../context/context';
import { expect } from 'chai';
import { DataTable } from '@cucumber/cucumber';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { routesV1 } from '../../config/routes-v1';
import { SharedContext } from '../context/type/shared-context.type';
import { Id as ProfessionalExperienceId } from '../../src/domain/professional-experience/id';

@binding([Context])
export class ProfessionalExperienceStep {
  private sharedContext: SharedContext;

  constructor(protected context: Context) {
    this.sharedContext = Context.sharedContext;
  }

  @given(/^I create a professional experience for the mentor with these details:$/)
  async createProfessionalExperience(data: DataTable) {
    this.sharedContext.requestBody.createProfessionalExperience = Object.fromEntries(data.transpose().raw());

    const body = this.sharedContext.requestBody.createProfessionalExperience;

    const mentor_id = this.sharedContext.registered.mentors[0].id.value ?? randomUUID();

    const accessToken = this.sharedContext.user.userAccessToken;

    if (accessToken) {
      this.sharedContext.requestResponse.createProfessionalExperience = await request(Context.app.getHttpServer())
        .post(routesV1.professional_experience.root)
        .query({ mentor_id })
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body);
      return;
    }

    this.sharedContext.requestResponse.createProfessionalExperience = await request(Context.app.getHttpServer())
      .post(routesV1.professional_experience.root)
      .query({ mentor_id })
      .send(body);
  }

  @given(/^I should see the professional experience created successfully$/)
  async professionalExperienceIsRegistered() {
    expect(this.sharedContext.requestResponse.createProfessionalExperience.status).to.equal(201);

    const professionalExperienceId = new ProfessionalExperienceId(
      this.sharedContext.requestResponse.createProfessionalExperience.body.id,
    );
    const professionalExperienceResult = await this.sharedContext.repositories.professionalExperience.get(
      professionalExperienceId,
    );
    if (professionalExperienceResult.isErr()) {
      throw new Error('Professional Experience not found, and it should be');
    }
  }

  @when(/^I try to get one of the experience from a mentor$/)
  async getProfessionalExperienceFromAMentor() {
    const mentor_id = this.sharedContext.registered.mentors[0].id.value ?? randomUUID();

    const experienceId = this.sharedContext.registered.mentors[0].professionalExperiences[0].id.value;

    this.sharedContext.requestResponse.getProfessionalExperience = await request(Context.app.getHttpServer())
      .get(routesV1.professional_experience.get)
      .query({ mentor_id, ids: [experienceId] });
  }

  @when(/^I try to get the experiences from a mentor$/)
  async getProfessionalExperiencesFromAMentor() {
    const mentor_id = this.sharedContext.registered.mentors[0].id.value ?? randomUUID();

    const ids = this.sharedContext.registered.mentors[0].professionalExperiences.map(
      (experience) => experience.id.value,
    );

    this.sharedContext.requestResponse.getProfessionalExperience = await request(Context.app.getHttpServer())
      .get(routesV1.professional_experience.get)
      .query({ mentor_id, ids });
  }

  @when(/^I try get the experiences without providing identifiers$/)
  async getProfessionalExperiencesFromAMentorWithoutProvidingIds() {
    const mentor_id = this.sharedContext.registered.mentors[0].id.value ?? randomUUID();

    const ids = [];

    this.sharedContext.requestResponse.getProfessionalExperience = await request(Context.app.getHttpServer())
      .get(routesV1.professional_experience.get)
      .query({ mentor_id, ids });
  }

  @when(/^I try get the experiences for an unregistered mentor$/)
  async tryGetProfessionalExperiencesForAnUnregisteredMentor() {
    const mentor_id = randomUUID();

    const ids = this.sharedContext.registered.mentors[0].professionalExperiences.map(
      (experience) => experience.id.value,
    );

    this.sharedContext.requestResponse.getProfessionalExperience = await request(Context.app.getHttpServer())
      .get(routesV1.professional_experience.get)
      .query({ mentor_id, ids });
  }
  @then(/^the professional experience should not be created$/)
  async professionalExperienceCreationFailed() {
    expect(this.sharedContext.requestResponse.createProfessionalExperience.status).not.to.equal(201);
  }

  @then(/^I should get the experience$/)
  async retrieveExperience() {
    expect(this.sharedContext.requestResponse.getProfessionalExperience.status).to.equal(200);
    expect(this.sharedContext.requestResponse.getProfessionalExperience.body).to.have.length(1);
  }

  @then(/^I should get the multiple experiences from the mentor$/)
  async retrieveMultipleExperiences() {
    expect(this.sharedContext.requestResponse.getProfessionalExperience.body.length).to.be.greaterThan(1);
  }

  @then(/^I should get an error about getting experiences$/)
  async retrieveErrorExperiences() {
    expect(this.sharedContext.requestResponse.getProfessionalExperience.status).to.be.above(399);
    expect(this.sharedContext.requestResponse.getProfessionalExperience.status).to.be.lessThan(500);
  }
}
