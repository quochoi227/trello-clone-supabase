// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapOrder = (originalArray: Array<any>, orderArray: Array<any>, key: string) => {
  if (!originalArray || !orderArray || !key) return []

  const clonedArray = [...originalArray]
  const orderedArray = clonedArray.sort((a, b) => {
    return orderArray.indexOf(a[key]) - orderArray.indexOf(b[key])
  })

  return orderedArray
}