import PDFKit
let d = PDFDocument(url: URL(fileURLWithPath: CommandLine.arguments[1]))!
print("PAGES:", d.pageCount)
for i in 0..<d.pageCount { print("\n=== PAGE \(i+1) ==="); print(d.page(at:i)?.string ?? "") }
