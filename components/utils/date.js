import moment from "moment";

export const currentYrsExp = () => {
  const currentComanyJoinYr = moment(["2017", "09", "27"]);
  const currentYr = moment();
  var diffDuration = moment.duration(currentYr.diff(currentComanyJoinYr));
  return diffDuration;
};

export const totalExperianceYears = () => {
  const years = currentYrsExp().years();
  const months = currentYrsExp().months();
  let defaultString = years + "+ years ";

  if (months > 8) defaultString = years + " years " + months + " months ";
  return defaultString;
};
