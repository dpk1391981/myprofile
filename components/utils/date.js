import moment from "moment";

export const currentYrsExp = (year = '2017', month = '09', date = '27') => {
  // Convert to integers and adjust month (0-based index)
  const currentCompanyJoinDate = moment([parseInt(year), parseInt(month) - 1, parseInt(date)]);
  const currentDate = moment();
  return moment.duration(currentDate.diff(currentCompanyJoinDate));
};

export const totalExperianceYears = (year = '2017', month = '09', date = '27') => {
  const duration = currentYrsExp(year, month, date);
  const years = duration.years();
  const months = duration.months();

  let experienceStr = '';

  if (years > 0) {
    experienceStr += `${years} year${years > 1 ? 's' : ''}`;
  }

  if (months > 0) {
    if (experienceStr) experienceStr += ' ';
    experienceStr += `${months} month${months > 1 ? 's' : ''}`;
  }

  if (!experienceStr) {
    experienceStr = 'Less than a month';
  }

  return experienceStr;
};
