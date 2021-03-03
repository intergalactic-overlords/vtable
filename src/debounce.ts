const debounce = (func: () => void, wait: number, immediate?: boolean) => {
  let timeout: number | null | undefined = null;

  return function executedFunction() {
    const context = this;
    const args = arguments;

    let later = function () {
      console.log("GOGOGOGGOGO");
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    let callNow = immediate && !timeout;

    clearTimeout(timeout);

    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
};

export default debounce;
