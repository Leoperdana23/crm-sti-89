
// This hook is no longer needed - sales cannot login to the application
export const useSalesAuth = () => {
  const authenticateSales = async (email: string, password: string) => {
    throw new Error('Sales login has been disabled');
  };

  return {
    authenticateSales
  };
};
