// Dumps every text line with its page, x and y (PDF points, y from top) as TSV: page\tx\ty\ttext
import PDFKit
let d = PDFDocument(url: URL(fileURLWithPath: CommandLine.arguments[1]))!
for i in 0..<d.pageCount {
  guard let p = d.page(at: i), let sel = p.selection(for: p.bounds(for: .mediaBox)) else { continue }
  let h = p.bounds(for: .mediaBox).height
  for line in sel.selectionsByLine() {
    let b = line.bounds(for: p)
    let t = (line.string ?? "").replacingOccurrences(of: "\n", with: " ").trimmingCharacters(in: .whitespaces)
    if t.isEmpty { continue }
    print("\(i+1)\t\(String(format: "%.1f", b.minX))\t\(String(format: "%.1f", h - b.maxY))\t\(String(format: "%.1f", b.height))\t\(t)")
  }
}
