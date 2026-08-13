import {
  useLayoutEffect,
  useEffect,
  useRef,
} from 'react';

import {
  useLocation,
  useNavigationType,
} from 'react-router-dom';

export default function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();

  const scrollPositions = useRef(
    new Map(),
  );

  /*
    Browser-এর automatic scroll restore
    বন্ধ করে আমরা নিজেরা control করব.
  */
  useEffect(() => {
    const previous =
      window.history.scrollRestoration;

    window.history.scrollRestoration =
      'manual';

    return () => {
      window.history.scrollRestoration =
        previous;
    };
  }, []);

  useLayoutEffect(() => {
    const currentKey =
      location.key;

    /*
      BACK / FORWARD
      ----------------
      আগে যেখানে ছিলাম সেখানে ফিরবে.
    */
    if (
      navigationType === 'POP'
    ) {
      const savedPosition =
        scrollPositions.current.get(
          currentKey,
        );

      if (
        savedPosition !== undefined
      ) {
        requestAnimationFrame(() => {
          window.scrollTo({
            top: savedPosition,
            left: 0,
            behavior: 'instant',
          });
        });
      }
    }

    /*
      NEW PAGE
      ----------------
      নতুন page হলে top থেকে শুরু.
    */
    else {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });

      document.documentElement.scrollTop =
        0;

      document.body.scrollTop =
        0;
    }

    /*
      এই page থেকে বের হওয়ার আগে
      current scroll position save করবে.
    */
    return () => {
      scrollPositions.current.set(
        currentKey,
        window.scrollY,
      );
    };
  }, [
    location.key,
    navigationType,
  ]);

  return null;
}