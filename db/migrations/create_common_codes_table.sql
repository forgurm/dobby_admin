-- 공통 코드 테이블 생성
CREATE TABLE IF NOT EXISTS common_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_code VARCHAR(50) NOT NULL COMMENT '그룹 코드',
    code VARCHAR(50) NOT NULL COMMENT '코드',
    name VARCHAR(100) NOT NULL COMMENT '코드명',
    description TEXT COMMENT '설명',
    sort_order INT DEFAULT 0 COMMENT '정렬 순서',
    is_active BOOLEAN DEFAULT TRUE COMMENT '사용 여부',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_group_code (group_code, code)
) COMMENT '공통 코드 관리';

-- 게시판 타입 코드 입력
INSERT INTO common_codes 
    (group_code, code, name, description, sort_order) 
VALUES 
    ('BOARD_TYPE', 'NORMAL', '일반 게시판', '일반적인 텍스트 중심의 게시판', 1),
    ('BOARD_TYPE', 'IMAGE', '이미지 게시판', '이미지가 포함된 갤러리형 게시판', 2),
    ('BOARD_TYPE', 'SECRET', '비밀 게시판', '비밀번호가 필요한 게시판', 3);

-- 회원 상태 코드 입력 (예시)
INSERT INTO common_codes 
    (group_code, code, name, description, sort_order) 
VALUES 
    ('USER_STATUS', 'ACTIVE', '활성', '정상적으로 활동 중인 회원', 1),
    ('USER_STATUS', 'INACTIVE', '비활성', '휴면 상태의 회원', 2),
    ('USER_STATUS', 'BLOCKED', '차단', '관리자에 의해 차단된 회원', 3);

-- 게시글 상태 코드 입력 (예시)
INSERT INTO common_codes 
    (group_code, code, name, description, sort_order) 
VALUES 
    ('POST_STATUS', 'DRAFT', '임시저장', '작성 중인 게시글', 1),
    ('POST_STATUS', 'PUBLISHED', '게시', '공개된 게시글', 2),
    ('POST_STATUS', 'HIDDEN', '숨김', '숨겨진 게시글', 3); 