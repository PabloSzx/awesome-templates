export const SECRET =
  process.env.SECRET ??
  (() => {
    console.warn("Please use SECRET env variable");
    return "ñ1opj23io123";
  })();
