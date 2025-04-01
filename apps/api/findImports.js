const fs = require("fs")
const path = require("path")

function findImportStatements(dir, fileExtensions = [".js", ".jsx", ".ts", ".tsx"]) {
  const results = []

  function searchDirectory(directory) {
    const files = fs.readdirSync(directory)

    for (const file of files) {
      const filePath = path.join(directory, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory()) {
        // ค้นหาในโฟลเดอร์ย่อย
        searchDirectory(filePath)
      } else if (fileExtensions.includes(path.extname(file))) {
        // อ่านไฟล์และค้นหา import statement
        const content = fs.readFileSync(filePath, "utf8")
        if (content.includes("import ")) {
          results.push({
            file: filePath,
            line: content.split("\n").findIndex((line) => line.includes("import ")) + 1,
          })
        }
      }
    }
  }

  searchDirectory(dir)
  return results
}

// ค้นหาในโฟลเดอร์ src
const importFiles = findImportStatements(path.join(__dirname, "src"))

console.log("Files with import statements:")
importFiles.forEach((item) => {
  console.log(`${item.file} (line ${item.line})`)
})

