import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { routesV1 } from '../../../../config/routes-v1';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload as Auth0JwtPayload } from '../../../infrastructure/authentication/auth0/module/interface/jwt-payload.interface';
import { UserService } from '../../../infrastructure/service/user/user.service';
import { Auth0UserId } from '../../../infrastructure/resource/auth0/type/auth0-user-id';
import { UserNotFoundException } from '../../../infrastructure/exception/user-not-found.exception';
import { Customer } from '../../../domain/customer';
import { Mentor } from '../../../domain/mentor';

@Controller(routesV1.accountData.root)
export class GetAccountDataHttpHandler {
  constructor(private readonly userService: UserService) {}
  @UseGuards(AuthGuard())
  @Get()
  async getAccountData(@Request() request: Request & { user: Auth0JwtPayload }) {
    const user: Auth0JwtPayload = request.user;
    const auth0UserId = new Auth0UserId(user.sub);

    const userData = await this.userService.getUserAccountData(auth0UserId);

    if (!userData.hasUserAccount) {
      throw new UserNotFoundException('cannot retrieve user account data.User account not found.');
    }

    if (userData.profile.isCustomer) {
      const customer = userData.profile.profileData as Customer;
      return {
        type: customer.customerType.value,
        bookmarked_mentors: customer.bookmarkedMentors.map((id) => id.value),
        firstname: customer.user.person?.firstname ?? null,
        lastname: customer.user.person?.lastname ?? null,
        nickname: customer.user.person?.nickname ?? null,
        phone_number: customer.user.person?.phoneNumber.value ?? null,
      };
    }
    if (userData.profile.isMentor) {
      const mentor = userData.profile.profileData as Mentor;

      return {
        languages: mentor.languages.map((language) => language.value),
        skills: mentor.skills.map((skill) => skill.name),
        profile_title: mentor.profileTitle,
        profile_description: mentor.profileDescription,
        availability_type: mentor.availability,
        course_type: mentor.trainingType.map((type) => type.value),
        experiences_id: mentor.professionalExperiences.map((experience) => experience.id.value),
        pricing_plans_id: mentor.pricingPlans.map((plan) => plan.id.value),
        current_job_title: mentor.currentJob,
        display_nickname: mentor.settings.settingDisplayNickname,

        firstname: mentor.user.person.firstname ?? null,
        lastname: mentor.user.person.lastname ?? null,
        nickname: mentor.user.person.nickname ?? null,
      };
    }
  }
}
