// api/sheet.js
// Vercel 서버리스 함수: Google Sheet CSV를 대신 가져와서 반환

export default async function handler(req, res) {
  const sheetUrl = process.env.GOOGLE_SHEET_CSV_URL;

  if (!sheetUrl) {
    console.error("환경변수 GOOGLE_SHEET_CSV_URL 이 설정되어 있지 않습니다.");
    res
      .status(500)
      .json({ error: "GOOGLE_SHEET_CSV_URL 환경변수가 없습니다." });
    return;
  }

  try {
    const response = await fetch(sheetUrl);

    if (!response.ok) {
      console.error("Google Sheet 요청 실패:", response.status, response.statusText);
      res.status(500).json({ error: "Google Sheet에서 데이터를 가져오지 못했습니다." });
      return;
    }

    const csvText = await response.text();

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    // 같은 도메인에서만 쓸 거라 CORS 헤더는 필수는 아니지만, 여유로 추가
    res.setHeader("Access-Control-Allow-Origin", "*");

    res.status(200).send(csvText);
  } catch (err) {
    console.error("시트 연동 중 에러:", err);
    res.status(500).json({ error: "시트 연동 중 오류가 발생했습니다." });
  }
}
