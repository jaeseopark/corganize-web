import { useCookies } from "react-cookie";

/**
 * Usage:
 *   const isAuthenticated = useAuthentication();
 * @returns whether or not the user is authenticated
 */
const useAthentication = () => {
  const [cookies] = useCookies(["crg-token"]);
  return !!cookies["crg-token"];
};

export default useAthentication;
