// ============================================================
// 구매보증 랜딩페이지 — Google Apps Script 웹앱
// 역할: 폼 데이터 → Google Sheets 저장 + 담당자 이메일 알림
//
// 배포 방법:
// 1. Google Apps Script (script.google.com) 에서 새 프로젝트 생성
// 2. 이 코드 붙여넣기
// 3. SHEET_ID, NOTIFY_EMAIL 수정
// 4. 배포 → 새 배포 → 웹 앱 → 액세스: 모든 사용자 → 배포
// 5. 생성된 URL을 landing/script.js 의 GAS_URL 에 붙여넣기
// ============================================================

const SHEET_ID     = 'YOUR_GOOGLE_SHEET_ID'; // 시트 ID (URL에서 복사)
const SHEET_NAME   = '상담신청';               // 시트 탭 이름
const NOTIFY_EMAIL = 'gfc2013@naver.com'; // 알림 받을 이메일

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    saveToSheet(data);
    sendNotificationEmail(data);
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function saveToSheet(data) {
  const ss    = SpreadsheetApp.openById(SHEET_ID);
  let sheet   = ss.getSheetByName(SHEET_NAME);

  // 시트 없으면 자동 생성 + 헤더 추가
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['접수시간', '대표자명', '업체명', '사업자번호', '연락처', '개업연도', '연매출액', '취급품목']);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#0F2D6B').setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    data.timestamp || new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    data.name    || '',
    data.company || '',
    data.bizno   || '',
    data.phone   || '',
    data.year    || '',
    data.revenue || '',
    data.items   || '',
  ]);
}

function sendNotificationEmail(data) {
  const subject = `[구매보증 상담신청] ${data.company || ''} · ${data.name || ''}`;
  const body = `
새로운 구매보증 상담 신청이 접수되었습니다.

━━━━━━━━━━━━━━━━━━━━━━━━
접수 시간    : ${data.timestamp}
대표자명     : ${data.name}
업체명       : ${data.company}
사업자번호   : ${data.bizno}
연락처       : ${data.phone}
개업연도     : ${data.year}
연 매출액    : ${data.revenue}
취급 품목    : ${data.items || '(미입력)'}
━━━━━━━━━━━━━━━━━━━━━━━━

Google Sheets에서 전체 신청 목록을 확인하세요.
https://docs.google.com/spreadsheets/d/${SHEET_ID}
  `.trim();

  GmailApp.sendEmail(NOTIFY_EMAIL, subject, body);
}

// GET 요청 테스트용 (배포 후 브라우저에서 URL 접속 시 확인)
function doGet() {
  return ContentService
    .createTextOutput('구매보증 GAS 웹앱 정상 작동 중')
    .setMimeType(ContentService.MimeType.TEXT);
}
