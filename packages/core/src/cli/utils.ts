export function isNetworkUrl(str: string) {
  // eslint-disable-next-line regexp/no-unused-capturing-group
  return /^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{1,64})?\.)+[a-z]{2,6}\/?/.test(str)
}
