import getEnv from "./get-env";

const testing = getEnv("TESTING") === "yes" ? true : false;
export default testing;
