import { useEffect } from 'react';

import { useRouter } from 'next/router';

import useUiStore from '@/store/ui/store';
import { Load } from '@/store/ui/types';
import useUserStore from '@/store/user/store';
import { routes, RouteTypes } from '@/utils/routes';

const useAuthVerify = (type: RouteTypes): boolean => {
  const router = useRouter();

  const { enableLoad } = useUiStore();
  const { user } = useUserStore();

  useEffect(() => {
    switch (type) {
      case RouteTypes.Private:
        if (!user) {
          enableLoad(Load.RedirectToLogin);
          void router.push(routes.login());
        }
        break;
      case RouteTypes.Protected:
        if (!!user) {
          enableLoad(Load.RedirectToConfigurations);
          void router.push(routes.configurations());
        }
        break;
      default:
        break;
    }
  }, [enableLoad, router, type, user]);

  return (RouteTypes.Private && !!user) || (RouteTypes.Protected && !user);
};

export default useAuthVerify;
