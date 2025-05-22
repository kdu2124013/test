import { Auth } from "@/types/auth.type";
import { emailReg, nicknameReg, passwordReg } from "@/lib/utils/auth/authValidation";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  try {
    const { nickname, email, password, passwordConfirm, isOAuth }: Auth = await request.json();

    // 에러 메시지 초기화
    const errorMessage = {
      nickname: "",
      email: "",
      password: "",
      passwordConfirm: ""
    };

    // 닉네임 유효성 검사
    if (!nicknameReg.test(nickname)) {
      errorMessage.nickname = "사용 불가능한 닉네임입니다.";
    }

    // 이메일 중복 검사
    const { data: emailExists, error: emailExistsError } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .single();

    // 1. 이메일 존재 여부 체크
    if (emailExists) {
      errorMessage.email = "이미 가입된 이메일입니다. 다른 이메일을 입력해주세요.";
    }

    // 2. 이메일 형식 검사
    if (!emailReg.test(email)) {
      errorMessage.email = "잘못된 형식의 이메일 주소입니다.";
    }

    // 비밀번호 유효성 검사
    if (!passwordReg.test(password)) {
      errorMessage.password = "영문, 숫자, 특수문자를 조합하여 입력해주세요.(6~12자)";
    }

    // 비밀번호 확인 일치 검사
    if (password !== passwordConfirm) {
      errorMessage.passwordConfirm = "입력한 비밀번호와 일치하지 않습니다.";
    }

    if (!passwordConfirm) {
      errorMessage.passwordConfirm = "빈칸을 입력해주세요.";
    }

    // 에러가 있으면 오류 메시지 반환
    const hasErrors = Object.values(errorMessage).some((value) => value !== "");
    if (hasErrors) {
      return NextResponse.json({ errorMessage }, { status: 400 });
    }

    // Supabase 회원가입
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname,
          isOAuth
        }
      }
    });

    // 회원가입 에러 처리
    if (signUpError) {
      return NextResponse.json({ error: signUpError.message }, { status: 400 });
    }

    // 회원가입 후 추가 정보 users 테이블에 삽입
    const { error: insertUserError } = await supabase.from("users").insert([
      {
        user_id: signUpData?.user?.id as string,
        nickname,
        email,
        isOAuth
      }
    ]);

    // 삽입 에러 처리
    if (insertUserError) {
      return NextResponse.json({ error: insertUserError.message }, { status: 400 });
    }

    // 성공적으로 회원가입 완료 후 데이터 반환
    return NextResponse.json(signUpData);
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
