/**
 * A simple holder for the react-router `navigate` function.
 * Set it once from a top-level component (AuthProvider) so that
 * non-React modules (e.g. the Axios interceptor) can trigger navigation
 * without a full page reload.
 */
let _navigate = null;

export const setNavigate = (fn) => {
  _navigate = fn;
};

export const navigateTo = (path) => {
  if (_navigate) {
    _navigate(path, { replace: true });
  } else {
    // Fallback: should only happen before the router mounts
    window.location.replace(path);
  }
};
