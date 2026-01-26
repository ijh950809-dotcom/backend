
//1. 기본 express설정
const express = require('express');//express 기본 라우팅
const app = express(); //app변수에 담기
const port = 9070; //통신포트 설정
const bcrypt = require('bcrypt');//해시 암호화를 위함
const jwt = require('jsonwebtoken');//토큰생성을 위함
const SECRET_KEY = 'test';//jwt서명시 사용할 비밀키

app.use(express.json()); //JSON 본문 파싱 미들웨어

//2. 다른 시스템간 통신을 임시 허용(교차출처공유)
const cors = require('cors');
app.use(cors());

//3. mysql db 정보설정
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'kdt'
});
connection.connect((err) => {
  if (err) {
    console.error('Mysql 연결실패 :', err);
    return;
  }
  console.log('Mysql DB연결성공');
});

//4. npm run dev 백앤드 서버실행시 콘솔모드에 내용 출력하기
app.listen(port, () => {
  console.log('Listening.....');
});

//5. app.get통신을 통해 테스트 해보기
// app.get('/', (req, res)=>{
//   //특정경로로 요청된 정보를 처리
//   res.json('Excused from Backend!');
// });

//6. sql쿼리문을 작성하여 데이터를 조회하고 화면에 출력하기
//express서버 통해 get요청하기 http://localhost/테이블명 =>myspq 테이블 자료 가져와라

//1. 조회 - goods db데이터 조회를 위한 내용
app.get('/goods', (req, res) => {
  connection.query('SELECT * FROM goods', (err, results) => {
    if (err) {
      console.error('쿼리오류', err);
      res.status(500).json({ error: 'DB쿼리오류' });
      return;
    }
    res.json(results);//json데이터로 받아옴
  });
});

//1. fruits db 조회하기
app.get('/fruits', (req, res) => {
  connection.query("SELECT * FROM fruits ORDER BY fruits.num DESC", (err, result) => {
    if (err) {
      console.log('쿼리문 오류 :', err);
      return;
    }
    //json 데이터로 결과를 저장
    res.json(result);
  })
});

//1. bookstore db조회하기
app.get('/bookstore', (req, res) => {
  connection.query('SELECT * FROM book_store ORDER BY code DESC', (err, result) => {
    if (err) {
      console.error('쿼리오류 : ', err);
      res.status(500).json({ error: 'DB쿼리오류' });
      return;
    }
    res.json(result);//오류가없으면 json 객체로 반환
  });
});

//1. noodle db 조회하기
app.get('/noodle', (req, res) => {
  connection.query('SELECT * FROM noodle ORDER BY num DESC', (err, result) => {
    if (err) {
      console.error('쿼리오류:', err);
      res.status(500).json
        ({ error: 'DB쿼리오류' });
      return;
    }
    res.json(result);
  })
})
//2. 특정 num값을 조회하여 결과를 리턴
app.get('/fruits/:num', (req, res) => {
  const num = req.params.num;
  connection.query(
    'SELECT * FROM fruits WHERE num=?', [num], (err, result) => {
      if (err) {
        console.log('조회오류:', err);
        res.status(500).json({ error: '상품조회실패' });
        return;
      }
      if (result.length == 0) {
        res.status(404).json({ error: '해당상품이 존재하지 않습니다.' });
        return;
      }
      res.json(result[0]);//단일객체를 반환한다.(1개)
    }
  )
})

//2. 입력 - db데이터 입력을 위한 내용(input)
app.post('/goods', (req, res) => {
  const { g_name, g_cost } = req.body;

  //유효성 검사
  if (!g_name || !g_cost) {
    return res.status(400).json({ error: '필수항목이 누락되었습니다. 다시 확인하세요.' });
  }

  //input쿼리문 작성하여 db입력이 되게함
  connection.query(
    'INSERT INTO goods (g_name, g_cost) VALUES (?, ?)',
    [g_name, g_cost], (err, result) => {
      if (err) {
        console.log('DB입력실패 :', err);
        res.status(500).json({ error: '상품등록실패' });
        return;
      }
      res.json({ success: true, insertId: result.insertId });
    }
  );
});

//2.  입력 - fruits테이블 db입력을 위한 내용
app.post('/fruits', (req, res) => {
  const { name, price, color, country } =
    req.body;//값을 넘겨받음
  if (!name || !price || !color || !country) {
    return res.status(400).json({ error: '필수항목이 누락되었습니다.' });
  }
  //이상이 없다면 쿼리문 작성하여 db입력한다.
  connection.query(
    'INSERT INTO fruits (name, price, color, country) VALUES (?, ?, ?, ?)', [name, price, color, country],
    (err, result) => {
      if (err) {
        console.log('등록오류:', err);
        res.status(500).json({ error: '상품등록실패' });
        return
      }
      res.json({ success: true, insertId: result.insertId });
    }
  );
});

//2. 입력 - bookstore테이블 db입력을 위한 내용
app.post('/bookstore', (req, res) => {
  const { name, area1, area2, area3, book_cnt, owner_nm, tel_num } =
    req.body;
  //데이터 유효성 검사
  if (!name || !area1 || !area2 || !area3 || book_cnt === null || !owner_nm || !tel_num) {
    return res.status(400).json({ error: '필수항목이 누락되었습니다.' });
  }
  //데이터 유효성 검사 통과되면 sql쿼리문으로 db에 입력을 해야
  connection.query(
    'INSERT INTO book_store (name, area1, area2, area3, book_cnt, owner_nm, tel_num) VALUES (?,?,?,?,?,?,?)',
    [name, area1, area2, area3, book_cnt, owner_nm, tel_num],
    (err, result) => {
      if (err) {
        console.log('등록오류:', err);
        res.status(500).json({ error: '데이터 등록 실패' });
        return;
      }
      res.json({ success: true, insertId: result.insertId })
    }
  );
});

//2.noodle데이터 입력을 위한
app.post('/noodle', (req, res) => {
  const { name, company, kind, price, e_date, reg_date } =
    req.body;
  connection.query(
    'INSERT INTO noodle (name, company, kind, price, e_date, reg_date) VALUES (?,?,?,?,?,?)', [name, company, kind, price, e_date, reg_date],
    (err, result) => {
      if (err) {
        console.log('등록오류:', err);
        res.status(500).json({ error: '데이터등록실패' });
        return;
      }
      res.json({
        success: true,
        insertId: result.insertId
      })
    }
  )
})
//3. 삭제 - 
app.delete('/goods/:g_code', (req, res) => {
  //넘겨받은 코드번호 저장
  const g_code = req.params.g_code;
  //삭제쿼리 작성
  connection.query(
    'DELETE FROM goods WHERE g_code= ?',
    [g_code],
    (err, result) => {
      if (err) {
        console.log('삭제오류 : ', err);
        res.status(500).json({ error: '상품삭제 실패' });
        return;
      }
      res.json({ success: true });
    }
  );
});

//fruits 데이터 삭제
app.delete('/fruits/:num', (req, res) => {
  const num = req.params.num;
  connection.query(
    'DELETE FROM fruits WHERE num= ?',
    [num],
    (err, result) => {
      if (err) {
        console.log('삭제오류 : ', err);
        res.status(500).json({ error: '상품삭제 실패' });
        return;
      }
      res.json({ seccess: true });
    }
  );
});

//3. bookstore데이터 삭제
app.delete('/bookstore/:code', (req, res) => {
  const code = req.params.code;
  connection.query(
    'DELETE FROM book_store WHERE code=?',
    [code],
    (err, result) => {
      if (err) {
        console.log('삭제오류 :', err);
        res.status(500).json({ error: '상품삭제 실패' });
        return;
      }
      res.json({ success: true })
    }
  );
})

//3. noodle 데이터 삭제
app.delete('/noodle/:num', (req, res) => {
  const num = req.params.num;
  connection.query(
    'DELETE FROM noodle WHERE num=?', [num],
    (err, result) => {
      if (err) {
        console.log('삭제오류:', err);
        res.status(500).json
          ({ error: '상품삭제실패' });
        return;
      }
      res.json({ success: true })
    }
  );
})


//4. 해당 g_code에 대한 자료조회하기
app.get('/goods/:g_code', (req, res) => {
  const g_code = req.params.g_code;

  connection.query(
    'SELECT * FROM goods WHERE g_code = ?'
    , [g_code], (err, result) => {
      if (err) {
        console.log('조회 오류 : ', err);
        res.status(500).json({ err: '상품 조회실패' });
        return;
      }

      if (result.length == 0) {
        res.status(404).json({ err: '해당 자료가 존재하지 않습니다.' });
        return;
      }
      res.json(result[0]); //하나만 반환
    }
  );
});

//4. bookstore 해당 code값을 받아 조회하여 결과를 리턴한다.(수정을 위함)
app.get('/bookstore/:code', (req, res) => {
  const code = req.params.code;

  connection.query(
    'SELECT * FROM book_store WHERE code = ?',
    [code],
    (err, results) => {
      if (err) {
        console.log('조회오류:', err);
        res.status(500).json({ error: '데이터조회실패' });
        return;
      }
      if (results.length == 0) {
        res.status(404).json({ error: '해당자료가 존재하지 않습니다.' });
        return;
      }
      res.json(results[0]);//단일값 반환
    }
  )
});

//4. noodle 수정을 위한 자료조회
app.get('/noodle/:num', (req, res) => {
  const num = req.params.num;

  connection.query(
    'SELECT * FROM noodle WHERE num = ?',
    [num],
    (err, result) => {
      if (err) {
        console.log('조회오류:', err);
        res.status(500).json({ error: '데이터조회실패' });
        return;
      }
      if (result.length == 0) {
        res.status(404).json
          ({ error: '해당자료가 존재하지 않습니다.' });
        return;
      }
      res.json(result[0]);
    }
  )
})
//5. 수정(update) - 
//상품수정은 상품코드(g_code)를 기준으로 수정한다.
app.put('/goods/goodsupdate/:g_code', (req, res) => {
  const g_code = req.params.g_code;//url주소뒤에 붙는 파라미터값으로 가져오고
  const { g_name, g_cost } = req.body; //프론트엔드에서 넘겨받은 값

  //update쿼리문으로 데이터 수정하기
  connection.query(
    'UPDATE goods SET g_name = ?, g_cost=? where g_code= ?', [g_name, g_cost, g_code],
    (err, result) => {
      if (err) {
        console.log('수정 오류 : ', err);
        res.status(500).json({ error: '상품 수정 실패' });
        return;
      }
      res.json({ success: true });
    }
  )
});

//fruits상품정보수정 쿼리 실행
app.put('/fruits/fruitsupdate/:num', (req, res) => {
  const num = req.params.num;
  const { name, price, color, country } = req.body;

  //필수 유효성 검사
  if (!name || !price || !color || !country) {
    return res.status(400).json({ error: '필수항목이 누락되었습니다. 다시 확인하세요' });
  }

  //업데이트 쿼리문 실행하기
  connection.query(
    'UPDATE fruits SET name=?, price=?, color=?, country=? WHERE num=?', [name, price, color, country, num], (err, result) => {
      if (err) {
        console.log('수정오류:', err);
        res.status(500).json({ error: '상품수정하기실패' })
        return;
      }
      res.json({ success: true });
    }
  )
})

//bookstore데이터 정보수정 쿼리실행
app.put('/bookstore/bookstoreupdate/:code', (req, res) => {
  const code = req.params.code;
  const { name, area1, area2, area3, book_cnt, owner_nm, tel_num } = req.body;
  connection.query(
    'UPDATE book_store SET name=?, area1=?, area2=?, area3=?, book_cnt=?, owner_nm=?, tel_num=? WHERE code=?', [name, area1, area2, area3, book_cnt, owner_nm, tel_num, code], (err, result) => {
      if (err) {
        console.log('수정오류:', err);
        res.status(500).json({ err: '상품수정실패' });
        return;
      }
      res.json({ success: true });
    }
  );
})

//5. 수정(update) - 
//상품수정은 상품코드(num)를 기준으로 수정한다.
app.put('/noodle/noodleupdate/:num', (req, res) => {
  const num = req.params.num;//url주소뒤에 붙는 파라미터값으로 가져오고
  const { name, company, kind, price, e_date, reg_date } = req.body; //프론트엔드에서 넘겨받은 값

  //update쿼리문으로 데이터 수정하기
  connection.query(
    'UPDATE noodle SET name = ?, company=?, kind=?, price=?, e_date=?,reg_date=? WHERE num=?', [name, company, kind, price, e_date, reg_date, num],
    (err, result) => {
      if (err) {
        console.log('수정 오류 : ', err);
        res.status(500).json({ error: '상품 수정 실패' });
        return;
      }
      res.json({ success: true });
    }
  )
});

//question(문의사항 접수하기 처리)
app.post('/api/question', (req, res) => {
  const { name, phone, email, content } = req.body;

  //2. 유효성 검사
  if (!name || !phone || !email || !content) {
    return res.status(400).json({ error: '필수항목이 누락되었습니다.' });
  }
  //이상이 없다면 (데이터를 모두 받았다면) 쿼리문 실행하여 db입력
  connection.query(
    'INSERT INTO question(name, phone, email, content) VALUES (?,?,?,?)', [name, phone, email, content],
    (err, result) => {
      if (err) {
        console.log('DB입력오류:', err);//에러출력
        res.status(500).json({ error: '상품등록실패' });
        return;
      }//성공하면 실행
      res.send('질문등록 완료');
    }
  )
});

//
app.get('/question', (req, res) => {
  connection.query('SELECT * FROM question ORDER BY  question.id DESC', (err, result) => {
    if (err) {
      console.error('쿼리오류,err');
      res.status(500).json({ error: 'DB쿼리오류' });
      return;
    }
    res.json(result);
  })
});

//join.js에서 넘겨받은 데이터를 가지고 회원가입
app.post('/join', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);

    connection.query(
      'INSERT INTO users (username, password) VALUES (?,?)', [username, hash], (err) => {
        if (err) {
          if (err.code == 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: '이미존재하는 아이디입니다.' });
          }
          return res.status(500).json({ error: '회원가입실패' });
        }
        res.json({ success: true });
      }
    );
  } catch (error) {
    res.status(500).json({ error: '서버내부오류' });
  }
});

//로그인 폼에서 id, pw 넘겨받은 데이터를 가지고 조회하여 일치하면 토큰생성하고 로그인 처리하기
app.post('/login', (req, res) => {
  //프론트에서 넘겨온 body태그안의 값을 변수에 저장
  const { username, password } = req.body;

  //쿼리문 작성하여 데이터가 일치하는지 조회를 한다.
  connection.query('SELECT * FROM users WHERE username=?', [username], async (err, result) => {
    if (err || result.length == 0) {
      return res.status(401).json({
        error: '아이디 또는 비밀번호가 틀렸습니다.'
      });
    }
    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: '아이디 또는 비밀번호가 틀립니다.' })
    }
    //위 과정에서 id와 pw가 일치하면 토큰을 생성(1시간)
    const token = jwt.sign({ id: user.id, username: username },
      SECRET_KEY, { expiresIn: '1h' });
    //토큰발급
    res.json({ token });
  });
});