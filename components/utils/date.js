import moment from "moment";

export const currentYrsExp = () => {
  const currentComanyJoinYr = moment(["2017", "09", "27"]);
  const currentYr = moment();
  var diffDuration = moment.duration(currentYr.diff(currentComanyJoinYr));
  return diffDuration;
};

export const totalExperianceYears = () => {
  return currentYrsExp().years();
};
