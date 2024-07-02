import { Mentor } from '../../../../domain/mentor';

export function getMentorPublicProfile(mentor: Mentor) {
  const nameOrNickname = (mentor: Mentor) => {
    if (mentor.user.person.nickname && mentor.settings.settingDisplayNickname) {
      return { nickname: mentor.user.person.nickname };
    }
    return {
      firstname: mentor.user.person.firstname,
      lastname: mentor.user.person.lastname,
    };
  };

  const retrieveContactInfos = (mentor: Mentor) => {
    const contactInfos = {};
    if (mentor.user.person.phoneNumber && mentor.settings.settingDisplayPhoneNumber) {
      contactInfos['phone_number'] = mentor.user.person.phoneNumber.value;
    }
    if (mentor.user.email && mentor.settings.settingDisplayEmail) {
      contactInfos['email'] = mentor.user.email.value;
    }
    if (mentor.user.person.linkedin && mentor.settings.settingDisplayLinkedin) {
      contactInfos['linkedin'] = mentor.user.person.linkedin;
    }

    return contactInfos;
  };

  /**
  const retrieveProfilePhoto = (mentor:Mentor) => {
    if (mentor. && mentor.display_profile_photo) {
      return {profile_photo_url: mentor.profile_photo;
    }
    return undefined;
  };
  **/

  const retrieveLocation = (mentor: Mentor) => {
    if (mentor.user.person.googlePlaceId && mentor.settings.settingDisplayLocation) {
      return { location: mentor.user.person.googlePlaceId };
    }
    return undefined;
  };

  const retrieveCurrentJobTitle = (mentor: Mentor) => {
    if (mentor.currentJob && mentor.settings.settingDisplayCurrentJobTitle) {
      return { current_job_title: mentor.currentJob };
    }
    return undefined;
  };

  return {
    id: mentor.id.value,
    languages: mentor.languages.map((language) => ({
      language: language.value,
    })),
    profile_title: mentor.profileTitle,
    profile_description: mentor.profileDescription,
    skills: mentor.skills.map((skill) => skill.name),
    availability_type: mentor.availability.value,
    course_type: mentor.trainingType.map((trainingType) => trainingType.value),
    pricing_plans_ids: mentor.pricingPlans?.map((pricingPlan) => pricingPlan.id.value),
    experience_ids: mentor.professionalExperiences?.map((experience) => experience.id.value),

    ...nameOrNickname(mentor),
    ...retrieveCurrentJobTitle(mentor),
    ...retrieveContactInfos(mentor),
    ...retrieveLocation(mentor),
  };
}
