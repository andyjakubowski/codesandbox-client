/* eslint-disable no-eval */
import buildProcess from './utils/process';

const g = typeof window === 'undefined' ? self : window;

const hasGlobalDeclaration = /^const global/m;

/* eslint-disable no-unused-vars */
export default function (
  code: string,
  require: Function,
  module: { exports: any },
  env: Object = {},
  globals: Object = {},
  {
    asUMD = false,
    isOfInterest = false,
  }: { asUMD?: boolean; isOfInterest?: boolean } = {}
) {
  if (isOfInterest) {
    // console.log('%c🟪 EVAL', 'font-weight: bold;');
    // console.log('code arg:');
    // console.log(code);
    // console.log('module arg:');
    // console.log(module);
  }
  const { exports } = module;

  const global = g;
  const process = buildProcess(env);
  // @ts-ignore
  g.global = global;

  // const debugRequire = function debugRequire(...args: any) {
  //   console.log('%c🎁 require CALLED in eval', 'font-weight: bold;');
  //   /* eslint-disable import/no-dynamic-require */
  //   return require(args);
  // };

  const allGlobals: { [key: string]: any } = {
    // require: isOfInterest ? debugRequire : require,
    require,
    module,
    exports,
    process,
    global,
    isOfInterest,
    ...globals,
  };

  if (asUMD) {
    delete allGlobals.module;
    delete allGlobals.exports;
    delete allGlobals.global;
  }

  if (hasGlobalDeclaration.test(code)) {
    delete allGlobals.global;
  }

  const allGlobalKeys = Object.keys(allGlobals);
  const globalsCode = allGlobalKeys.length ? allGlobalKeys.join(', ') : '';
  const globalsValues = allGlobalKeys.map(k => allGlobals[k]);
  try {
    const newCode =
      `(function $csb$eval(` + globalsCode + `) {` + code + `\n})`;
    if (isOfInterest) {
      // console.log('%c🟪 about to eval this newCode:', 'font-weight: bold;');
      // console.log('newCode arg:');
      // console.log(newCode);
    }
    // @ts-ignore
    (0, eval)(newCode).apply(allGlobals.global, globalsValues);
    if (isOfInterest) {
      // console.log('%c🟪 AFTER eval', 'font-weight: bold;');
    }

    return module.exports;
  } catch (e: any) {
    if (isOfInterest) {
      // console.log('%c🟪 eval: caught an error:', 'font-weight: bold;');
      // console.log('typeof e:');
      // console.log(typeof e);
      // console.log({ ...e });
    }
    let error = e;
    if (typeof e === 'string') {
      error = new Error(e);
    }
    error.isEvalError = true;

    if (isOfInterest) {
      // console.log('%c🟪 eval: re-throwing caught error', 'font-weight: bold;');
    }
    throw error;
  }
}
/* eslint-enable no-unused-vars */
