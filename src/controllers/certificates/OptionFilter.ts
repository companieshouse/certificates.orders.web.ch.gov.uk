export const optionFilter = (options: { value: string }[], filter: { [key: string]: boolean }): { value: string }[] => {
    return options.filter(option => !(option.value in filter) || filter[option.value]);
}
