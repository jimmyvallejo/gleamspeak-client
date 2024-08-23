export const copyToClipboard = (text: string) => {
if (text) {
    try {
        navigator.clipboard.writeText(text)
        console.log("Text copied to clipboard")
    } catch (err) {
        console.log("Failed to copy text: ", err)
    }
}
}