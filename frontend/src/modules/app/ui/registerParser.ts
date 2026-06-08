export const parseRegisterNumber = (register: string) => {
  if (!register || register.length !== 10) return null;

  // Жишээ нь: ФМ95112512 -> зөвхөн тоон хэсгийг салгаж авна (95112512)
  const digits = register.substring(2);
  if (!/^\d+$/.test(digits)) return null; // Хэрэв тоо биш бол буцна

  let yearShort = parseInt(digits.substring(0, 2)); // 95
  let month = parseInt(digits.substring(2, 4));     // 11
  const day = parseInt(digits.substring(4, 6));       // 25
  const genderDigit = parseInt(digits.substring(6, 7)); // 1 (Сүүлийн 2 орны эхнийх)

  let birthYear = 1900 + yearShort;

  // 2000 оноос хойш төрсөн хүмүүсийн сар дээр 20-ийг нэмсэн байдаг
  if (month > 20) {
    month = month - 20;
    birthYear = 2000 + yearShort;
  }

  // Одоогийн он сар өдрийг авах
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  // Насыг нарийн тооцоолох (Төрсөн өдөр нь өнгөрсөн эсэхийг шалгана)
  let age = currentYear - birthYear;
  if (currentMonth < month || (currentMonth === month && currentDay < day)) {
    age--; // Хэрэв энэ жилийн төрсөн өдөр нь хараахан болоогүй бол насыг 1-ээр хасна
  }

  // Хүйсийг тодорхойлох: Сүүлийн 2 орны эхний тоо ТЭГШ бол ЭМЭГТЭЙ, СОНДГОЙ бол ЭРЭГТЭЙ
  const sex = genderDigit % 2 === 0 ? "FEMALE" : "MALE";

  return { age, sex, birthYear, month, day };
};