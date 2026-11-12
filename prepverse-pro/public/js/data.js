/* PrepVerse Pro – built-in datasets (work offline, no AI needed) */
(function () {
  const D = (window.PVD = {});

  D.CATS = {
    quant: { n: 'Quantitative Aptitude', e: '🔢' },
    reason: { n: 'Logical Reasoning', e: '🧩' },
    verbal: { n: 'Verbal Ability', e: '📖' },
    cs: { n: 'CS Fundamentals', e: '🖥️' },
    dsa: { n: 'Data Structures & Algo', e: '🌲' },
    code: { n: 'Code Output', e: '⌨️' },
  };

  // q: question, o: options, a: correct index, e: explanation
  const Q = (c, q, o, a, e) => ({ c, q, o, a, e });
  D.QUIZ = [
    Q('quant', 'A 120 m long train passes a pole in 6 seconds. Its speed in km/h is:', ['54', '64', '72', '80'], 2, '120/6 = 20 m/s; 20 × 18/5 = 72 km/h.'),
    Q('quant', 'If 20% of a number is 50, the number is:', ['200', '250', '300', '350'], 1, '0.2x = 50 → x = 250.'),
    Q('quant', 'Two numbers are in ratio 3:5 and their sum is 64. The larger number is:', ['24', '32', '40', '48'], 2, 'Total parts = 8, one part = 8; larger = 5 × 8 = 40.'),
    Q('quant', 'Simple interest on ₹5000 at 8% p.a. for 3 years is:', ['₹1000', '₹1200', '₹1400', '₹1600'], 1, 'SI = P·R·T/100 = 5000×8×3/100 = ₹1200.'),
    Q('quant', 'A can finish a job in 12 days and B in 18 days. Together they finish in:', ['6 days', '7.2 days', '8 days', '9 days'], 1, 'Rate = 1/12 + 1/18 = 5/36 → 36/5 = 7.2 days.'),
    Q('quant', 'The average of the first 10 natural numbers is:', ['5', '5.5', '6', '6.5'], 1, 'Sum = 55; 55/10 = 5.5.'),
    Q('quant', 'An article bought for ₹400 is sold for ₹460. Profit % is:', ['10%', '12.5%', '15%', '20%'], 2, 'Profit = 60; 60/400 × 100 = 15%.'),
    Q('quant', 'Probability that the sum is 7 when two fair dice are rolled:', ['1/12', '1/6', '1/9', '5/36'], 1, '6 favourable outcomes out of 36 = 1/6.'),
    Q('reason', 'Find the next number: 2, 6, 12, 20, 30, ?', ['40', '42', '44', '46'], 1, 'Differences are 4, 6, 8, 10 → next difference 12 → 42 (n × (n+1)).'),
    Q('reason', 'If CAT is coded as 3120 (letter positions), DOG is coded as:', ['4157', '4167', '4158', '4147'], 0, 'D=4, O=15, G=7 → 4157.'),
    Q('reason', 'Pointing to a man, a woman says, "His mother is the only daughter of my mother." How is the woman related to the man?', ['Mother', 'Aunt', 'Sister', 'Grandmother'], 0, 'The only daughter of the woman\'s mother is the woman herself, so she is his mother.'),
    Q('reason', 'Find the odd one out: 27, 64, 100, 125', ['27', '64', '100', '125'], 2, '27, 64 and 125 are perfect cubes; 100 is not.'),
    Q('reason', 'You face North and turn right 90°, then right 90° again. You now face:', ['North', 'East', 'South', 'West'], 2, 'North → East → South.'),
    Q('reason', 'All roses are flowers. Some flowers fade quickly. Does it follow that some roses fade quickly?', ['Yes, always', 'No, never', 'Not necessarily', 'Only in summer'], 2, 'The "some flowers" might not include any roses, so the conclusion does not necessarily follow.'),
    Q('reason', 'The angle between the hour and minute hands at 3:00 is:', ['60°', '75°', '90°', '120°'], 2, 'Each hour mark = 30°; 3 × 30° = 90°.'),
    Q('reason', 'If A > B, B > C and C > D, which is the smallest?', ['A', 'B', 'C', 'D'], 3, 'A > B > C > D, so D is the smallest.'),
    Q('verbal', 'Choose the synonym of EPHEMERAL:', ['Lasting', 'Short-lived', 'Ancient', 'Harmful'], 1, 'Ephemeral means lasting a very short time.'),
    Q('verbal', 'Choose the antonym of BENEVOLENT:', ['Kind', 'Malevolent', 'Generous', 'Gentle'], 1, 'Benevolent = well-meaning; malevolent = wishing harm.'),
    Q('verbal', 'She is very good ___ mathematics.', ['in', 'at', 'on', 'with'], 1, '"Good at" is the correct collocation.'),
    Q('verbal', 'Choose the correct sentence:', ['Neither of the boys are present.', 'Neither of the boys is present.', 'Neither of the boys were present.', 'Neither of the boys be present.'], 1, '"Neither" takes a singular verb.'),
    Q('verbal', '"Break the ice" means:', ['Start a conversation in an awkward situation', 'Damage something', 'Become very angry', 'Go skating'], 0, 'It is an idiom for easing initial social tension.'),
    Q('verbal', 'One word for "a person who loves books":', ['Philanthropist', 'Bibliophile', 'Misanthrope', 'Polyglot'], 1, 'Bibliophile = lover of books.'),
    Q('verbal', 'Choose the grammatically correct sentence:', ['He do not know the answer.', 'He does not knows the answer.', 'He does not know the answer.', 'He not know the answer.'], 2, 'With "does", the main verb stays in base form.'),
    Q('verbal', 'Choose the synonym of CANDID:', ['Frank', 'Secretive', 'Rude', 'Shy'], 0, 'Candid = truthful and straightforward.'),
    Q('cs', 'Which scheduling policy can cause starvation?', ['Round Robin', 'FCFS', 'Priority scheduling without aging', 'Fair-share'], 2, 'Low-priority processes may wait forever unless aging is used.'),
    Q('cs', 'Which normal form is meant to remove transitive dependencies on the primary key?', ['1NF', '2NF', '3NF', 'None'], 2, '3NF removes transitive dependencies of non-key attributes on the key.'),
    Q('cs', 'Routing of packets happens at which OSI layer?', ['Data Link', 'Network', 'Transport', 'Session'], 1, 'The Network layer (IP) handles logical addressing and routing.'),
    Q('cs', 'Time complexity of binary search on a sorted array:', ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], 1, 'The search space halves every step.'),
    Q('cs', 'In ACID, the letter "I" stands for:', ['Integrity', 'Isolation', 'Indexing', 'Inheritance'], 1, 'Atomicity, Consistency, Isolation, Durability.'),
    Q('cs', 'Which is NOT a necessary condition for deadlock?', ['Mutual exclusion', 'Hold and wait', 'Circular wait', 'Preemption'], 3, 'Deadlock needs NO preemption; preemption would break it.'),
    Q('cs', 'Compile-time polymorphism is achieved through:', ['Method overriding', 'Method overloading', 'Virtual functions', 'Inheritance'], 1, 'Overloading is resolved at compile time; overriding at run time.'),
    Q('cs', 'HTTP status code 403 means:', ['Not Found', 'Forbidden', 'Bad Gateway', 'Created'], 1, '403 = server understood the request but refuses to authorise it.'),
    Q('dsa', 'A stack follows which order?', ['FIFO', 'LIFO', 'Random', 'Priority'], 1, 'Last In, First Out.'),
    Q('dsa', 'Worst-case time complexity of Quick Sort:', ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'], 1, 'Bad pivots (e.g. sorted input with first/last pivot) give O(n²).'),
    Q('dsa', 'Which data structure is used for Breadth-First Search?', ['Stack', 'Queue', 'Heap', 'Trie'], 1, 'BFS explores level by level using a queue.'),
    Q('dsa', 'Height of a balanced BST with n nodes is:', ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], 1, 'Balanced trees keep height logarithmic.'),
    Q('dsa', 'Detecting a cycle in a linked list in O(1) extra space uses:', ['Hashing', "Floyd's tortoise & hare", 'Recursion', 'Sorting'], 1, 'Two pointers moving at different speeds meet if there is a cycle.'),
    Q('dsa', 'In-order traversal of a BST yields:', ['Descending order', 'Ascending sorted order', 'Level order', 'Random order'], 1, 'Left → Root → Right visits keys in ascending order.'),
    Q('dsa', 'Average-case lookup time in a hash table:', ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], 0, 'With a good hash function and load factor, lookups are O(1).'),
    Q('dsa', "Dijkstra's algorithm fails when the graph has:", ['Cycles', 'Negative edge weights', 'Self loops', 'Directed edges'], 1, 'Use Bellman-Ford for graphs with negative edges.'),
    Q('code', 'JavaScript: console.log(typeof null)', ['undefined', 'null', 'object', 'number'], 2, 'A historical quirk: typeof null is "object".'),
    Q('code', 'JavaScript: console.log(0.1 + 0.2 === 0.3)', ['true', 'false', 'NaN', 'Error'], 1, 'Floating-point rounding makes 0.1+0.2 = 0.30000000000000004.'),
    Q('code', 'Python: print(len({1, 2, 2, 3}))', ['4', '3', '2', 'Error'], 1, 'Sets remove duplicates → {1,2,3}.'),
    Q('code', 'Python: print(2 ** 3 ** 2)', ['64', '512', '36', '128'], 1, '** is right-associative: 3**2 = 9, 2**9 = 512.'),
    Q('code', 'Java: int x = 5; System.out.println(x++ + ++x);', ['10', '11', '12', '13'], 2, 'x++ gives 5 (x=6), ++x gives 7 → 5 + 7 = 12.'),
    Q('code', 'C: int a = 10; printf("%d", a / 3);', ['3', '3.33', '4', '0'], 0, 'Integer division truncates → 3.'),
    Q('code', 'JavaScript: console.log([1,2,3] + [4])', ['1,2,34', '[1,2,3,4]', '10', '1,2,3,4'], 0, 'Arrays are converted to strings: "1,2,3" + "4" = "1,2,34".'),
    Q('code', 'Python: print("ab" * 2 + "c")', ['abc', 'ababc', 'abcc', 'ababcc'], 1, '"ab"*2 = "abab", then + "c".'),
  ];

  // Company-style mixes (category weights). Patterns change — treat as practice, not official syllabus.
  D.MIXES = {
    tcs: { n: 'TCS NQT style', cats: ['quant', 'reason', 'verbal', 'code'] },
    infosys: { n: 'Infosys style', cats: ['reason', 'quant', 'verbal', 'cs'] },
    wipro: { n: 'Wipro NLTH style', cats: ['quant', 'verbal', 'reason', 'code'] },
    tech: { n: 'Tech-round mix', cats: ['cs', 'dsa', 'code'] },
    all: { n: 'Everything', cats: Object.keys(D.CATS) },
  };

  // Coding problems (JavaScript, auto-graded in a Web Worker)
  D.PROBLEMS = [
    { id: 'twosum', t: 'Two Sum', d: 'Easy', tags: ['Array', 'Hash Map'], fn: 'twoSum', cmp: 'sorted', desc: 'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`. Exactly one solution exists; you may not use the same element twice. Return indices in any order.', ex: 'twoSum([2,7,11,15], 9) → [0,1]', starter: 'function twoSum(nums, target) {\n  // your code here\n}', tests: [[[[2, 7, 11, 15], 9], [0, 1]], [[[3, 2, 4], 6], [1, 2]], [[[3, 3], 6], [0, 1]], [[[1, 5, 3, 7], 10], [2, 3]]] },
    { id: 'reverse', t: 'Reverse a String', d: 'Easy', tags: ['String'], fn: 'reverseString', desc: 'Return the reverse of the string `s`.', ex: 'reverseString("hello") → "olleh"', starter: 'function reverseString(s) {\n  // your code here\n}', tests: [[['hello'], 'olleh'], [[''], ''], [['a'], 'a'], [['PrepVerse'], 'esreVperP']] },
    { id: 'valid', t: 'Valid Parentheses', d: 'Easy', tags: ['Stack', 'String'], fn: 'isValid', desc: 'Given a string of brackets `()[]{}`, return `true` if every bracket is closed by the same type in the correct order.', ex: 'isValid("()[]{}") → true; isValid("(]") → false', starter: 'function isValid(s) {\n  // your code here\n}', tests: [[['()'], true], [['()[]{}'], true], [['(]'], false], [['([)]'], false], [['{[]}'], true], [[''], true]] },
    { id: 'palin', t: 'Palindrome Number', d: 'Easy', tags: ['Math'], fn: 'isPalindrome', desc: 'Return `true` if integer `x` reads the same forwards and backwards. Negative numbers are not palindromes.', ex: 'isPalindrome(121) → true; isPalindrome(-121) → false', starter: 'function isPalindrome(x) {\n  // your code here\n}', tests: [[[121], true], [[-121], false], [[10], false], [[0], true], [[12321], true]] },
    { id: 'fizz', t: 'FizzBuzz', d: 'Easy', tags: ['Loop'], fn: 'fizzBuzz', desc: 'Return an array of strings for 1..n: "FizzBuzz" if divisible by 3 and 5, "Fizz" if by 3, "Buzz" if by 5, otherwise the number as a string.', ex: 'fizzBuzz(5) → ["1","2","Fizz","4","Buzz"]', starter: 'function fizzBuzz(n) {\n  // your code here\n}', tests: [[[3], ['1', '2', 'Fizz']], [[5], ['1', '2', 'Fizz', '4', 'Buzz']], [[15], ['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz']]] },
    { id: 'fib', t: 'Nth Fibonacci', d: 'Easy', tags: ['Recursion', 'DP'], fn: 'fib', desc: 'Return the n-th Fibonacci number where fib(0)=0 and fib(1)=1. Make it fast enough for n up to 40.', ex: 'fib(10) → 55', starter: 'function fib(n) {\n  // your code here\n}', tests: [[[0], 0], [[1], 1], [[10], 55], [[20], 6765], [[40], 102334155]] },
    { id: 'anagram', t: 'Valid Anagram', d: 'Easy', tags: ['String', 'Hash Map'], fn: 'isAnagram', desc: 'Return `true` if `t` is an anagram of `s` (same letters, same counts).', ex: 'isAnagram("listen","silent") → true', starter: 'function isAnagram(s, t) {\n  // your code here\n}', tests: [[['listen', 'silent'], true], [['rat', 'car'], false], [['a', 'ab'], false], [['anagram', 'nagaram'], true]] },
    { id: 'maxsub', t: 'Maximum Subarray', d: 'Medium', tags: ['Array', 'DP'], fn: 'maxSubArray', desc: 'Find the contiguous subarray with the largest sum and return that sum (Kadane\'s algorithm).', ex: 'maxSubArray([-2,1,-3,4,-1,2,1,-5,4]) → 6', starter: 'function maxSubArray(nums) {\n  // your code here\n}', tests: [[[[-2, 1, -3, 4, -1, 2, 1, -5, 4]], 6], [[[1]], 1], [[[5, 4, -1, 7, 8]], 23], [[[-3, -1, -2]], -1]] },
    { id: 'merge', t: 'Merge Sorted Arrays', d: 'Easy', tags: ['Array', 'Two Pointers'], fn: 'mergeSorted', desc: 'Merge two sorted arrays `a` and `b` into one sorted array.', ex: 'mergeSorted([1,3,5],[2,4,6]) → [1,2,3,4,5,6]', starter: 'function mergeSorted(a, b) {\n  // your code here\n}', tests: [[[[1, 3, 5], [2, 4, 6]], [1, 2, 3, 4, 5, 6]], [[[], [1]], [1]], [[[1, 1], [1]], [1, 1, 1]], [[[-5, 0], [-3, 2, 9]], [-5, -3, 0, 2, 9]]] },
    { id: 'lcp', t: 'Longest Common Prefix', d: 'Easy', tags: ['String'], fn: 'longestCommonPrefix', desc: 'Return the longest common prefix of an array of strings, or "" if none.', ex: 'longestCommonPrefix(["flower","flow","flight"]) → "fl"', starter: 'function longestCommonPrefix(strs) {\n  // your code here\n}', tests: [[[['flower', 'flow', 'flight']], 'fl'], [[['dog', 'racecar', 'car']], ''], [[['a']], 'a'], [[['interview', 'internet', 'internal']], 'inter']] },
    { id: 'bsearch', t: 'Binary Search', d: 'Easy', tags: ['Binary Search'], fn: 'search', desc: 'Given a sorted array `nums` and a `target`, return its index or -1 if absent. Aim for O(log n).', ex: 'search([-1,0,3,5,9,12], 9) → 4', starter: 'function search(nums, target) {\n  // your code here\n}', tests: [[[[-1, 0, 3, 5, 9, 12], 9], 4], [[[-1, 0, 3, 5, 9, 12], 2], -1], [[[5], 5], 0], [[[1, 2, 3, 4, 5, 6, 7], 1], 0]] },
    { id: 'stock', t: 'Best Time to Buy & Sell Stock', d: 'Medium', tags: ['Array', 'Greedy'], fn: 'maxProfit', desc: 'Given daily `prices`, return the maximum profit from one buy followed by one later sell (0 if no profit is possible).', ex: 'maxProfit([7,1,5,3,6,4]) → 5', starter: 'function maxProfit(prices) {\n  // your code here\n}', tests: [[[[7, 1, 5, 3, 6, 4]], 5], [[[7, 6, 4, 3, 1]], 0], [[[2, 4, 1]], 2], [[[1]], 0]] },
  ];

  D.COMPANIES = [
    { n: 'TCS', type: 'IT Services', rounds: ['TCS NQT (aptitude + reasoning + verbal + coding)', 'Technical interview', 'Managerial / HR'], focus: ['Quantitative aptitude', 'Basic programming', 'DBMS & OOPs', 'Communication'], tip: 'Speed and accuracy in the NQT matter most; revise one language (C/Java/Python) thoroughly.' },
    { n: 'Infosys', type: 'IT Services', rounds: ['Online test (reasoning, math, verbal, pseudocode)', 'Technical interview', 'HR interview'], focus: ['Pseudocode', 'Logical reasoning', 'DBMS & SQL', 'Projects'], tip: 'Practice pseudocode tracing and be ready to explain every line of your resume projects.' },
    { n: 'Wipro', type: 'IT Services', rounds: ['Online assessment (aptitude, verbal, coding)', 'Technical + HR interview'], focus: ['Aptitude', 'Written communication', 'Basic coding'], tip: 'The written-communication section is easy to neglect — practise essay/email writing.' },
    { n: 'Cognizant', type: 'IT Services', rounds: ['Aptitude & technical MCQs', 'Coding', 'Technical + HR interview'], focus: ['Aptitude', 'Coding basics', 'OOP concepts'], tip: 'Be clear on fundamentals; explain your thought process out loud.' },
    { n: 'Accenture', type: 'Consulting / IT', rounds: ['Cognitive & technical assessment', 'Coding', 'Communication assessment', 'Interview'], focus: ['Cognitive ability', 'Cloud & networking basics', 'Communication'], tip: 'Communication test is voice-based — practise speaking clearly and concisely.' },
    { n: 'Capgemini', type: 'IT Services', rounds: ['Game-based aptitude + pseudocode', 'Essay / voice assessment', 'Interview'], focus: ['Pseudocode', 'Aptitude', 'Communication'], tip: 'Pseudocode and logic puzzles are the differentiator.' },
    { n: 'Amazon', type: 'Product', rounds: ['Online assessment (2 coding + work-style)', '3–4 interview rounds (DSA + Leadership Principles)'], focus: ['Arrays, strings, trees, graphs, DP', 'Leadership Principles with STAR stories', 'System design basics (for experienced)'], tip: 'Prepare 6–8 STAR stories mapped to Leadership Principles.' },
    { n: 'Microsoft', type: 'Product', rounds: ['Online coding round', '3–4 technical rounds', 'Hiring manager round'], focus: ['DSA', 'Problem solving & clean code', 'OOP / design'], tip: 'Talk through trade-offs and test your code with edge cases before finishing.' },
    { n: 'Google', type: 'Product', rounds: ['Online assessment', 'Multiple DSA-heavy interviews', 'Googleyness'], focus: ['Advanced DSA', 'Complexity analysis', 'Collaboration'], tip: 'Practise explaining your approach before coding and optimising iteratively.' },
    { n: 'Flipkart', type: 'Product / E-commerce', rounds: ['Machine coding / DSA', 'System design', 'Hiring manager'], focus: ['DSA', 'LLD (machine coding)', 'System design basics'], tip: 'Practise low-level design problems (parking lot, splitwise) end to end.' },
  ];
  D.COMPANY_NOTE = 'Hiring patterns change every season — confirm the current process on each company\'s official careers page.';

  D.PORTALS = [
    { n: 'Internshala', u: 'https://internshala.com/internships', d: 'Internships & fresher jobs, popular with Indian students.' },
    { n: 'LinkedIn Jobs', u: 'https://www.linkedin.com/jobs/', d: 'Largest professional network — set job alerts and message recruiters.' },
    { n: 'Unstop', u: 'https://unstop.com/', d: 'Competitions, hackathons, internships and hiring challenges.' },
    { n: 'Naukri Campus', u: 'https://www.naukri.com/campus', d: 'Entry-level jobs and campus hiring.' },
    { n: 'AICTE Internship Portal', u: 'https://internship.aicte-india.org/', d: 'Government-backed internships for engineering students.' },
    { n: 'National Career Service', u: 'https://www.ncs.gov.in/', d: 'Govt. of India job and career portal.' },
    { n: 'Wellfound (AngelList)', u: 'https://wellfound.com/jobs', d: 'Startup roles and internships.' },
    { n: 'Indeed', u: 'https://www.indeed.com/', d: 'Aggregates jobs from many sites.' },
    { n: 'HackerEarth Challenges', u: 'https://www.hackerearth.com/challenges/', d: 'Coding challenges and hiring contests.' },
    { n: 'LeetCode', u: 'https://leetcode.com/problemset/', d: 'The standard DSA practice platform.' },
    { n: 'GeeksforGeeks', u: 'https://www.geeksforgeeks.org/', d: 'CS theory, company-wise experience articles.' },
    { n: 'GitHub Student Pack', u: 'https://education.github.com/pack', d: 'Free dev tools and credits for students.' },
  ];

  D.QBANK = [
    { c: 'HR', q: 'Tell me about yourself.', k: 'Present → Past → Future in ~90s: current education/skills, one or two proof points (project/internship), and why this role.' },
    { c: 'HR', q: 'What are your strengths and weaknesses?', k: 'Pick strengths relevant to the job with evidence. For weakness choose a real, non-critical one and show what you are doing to improve it.' },
    { c: 'HR', q: 'Why should we hire you?', k: 'Match your top 2–3 skills to the job description, add a concrete achievement, show enthusiasm to learn.' },
    { c: 'HR', q: 'Where do you see yourself in 5 years?', k: 'Show growth aligned with the company: deepen expertise, take on ownership, mentor others. Avoid job-hopping hints.' },
    { c: 'HR', q: 'Describe a conflict in a team and how you handled it.', k: 'Use STAR: Situation, Task, Action (listen, align on goals, compromise), Result. Stay respectful of the other person.' },
    { c: 'HR', q: 'Tell me about a time you failed.', k: 'Own the mistake, explain what you learned, and show a changed behaviour afterwards.' },
    { c: 'HR', q: 'Are you willing to relocate / work in shifts?', k: 'Be honest; show flexibility where genuine, and ask clarifying questions about the role.' },
    { c: 'HR', q: 'Do you have any questions for us?', k: 'Ask about team structure, learning opportunities, onboarding, and what success looks like in the first 6 months.' },
    { c: 'OOP', q: 'Explain the four pillars of OOP.', k: 'Encapsulation (data hiding), Abstraction (expose essentials), Inheritance (reuse), Polymorphism (many forms) — give a quick example for each.' },
    { c: 'OOP', q: 'Abstract class vs interface?', k: 'Abstract class: partial implementation, state, single inheritance. Interface: contract, multiple implementation (Java/C#). Use interface for capability, abstract class for shared base.' },
    { c: 'OOP', q: 'Overloading vs overriding?', k: 'Overloading: same name, different parameters, compile-time. Overriding: subclass redefines parent method, run-time.' },
    { c: 'DBMS', q: 'What are ACID properties?', k: 'Atomicity, Consistency, Isolation, Durability — guarantees of reliable transactions.' },
    { c: 'DBMS', q: 'Explain normalization up to 3NF.', k: '1NF: atomic values. 2NF: no partial dependency on part of a composite key. 3NF: no transitive dependency.' },
    { c: 'DBMS', q: 'INNER JOIN vs LEFT JOIN?', k: 'INNER returns only matching rows; LEFT returns all left rows plus matches (NULL if none).' },
    { c: 'DBMS', q: 'What is an index and its trade-off?', k: 'A data structure (often B-tree) speeding up reads; costs extra storage and slows writes.' },
    { c: 'OS', q: 'Process vs thread?', k: 'Process: independent address space. Thread: lightweight unit sharing the process memory; cheaper context switch but needs synchronisation.' },
    { c: 'OS', q: 'What is deadlock and how do you prevent it?', k: 'Circular waiting for resources. Needs mutual exclusion, hold & wait, no preemption, circular wait — break any one (e.g., ordering resources).' },
    { c: 'OS', q: 'Explain paging and virtual memory.', k: 'Memory divided into fixed-size pages mapped via page tables; virtual memory lets processes use more address space than physical RAM, swapping to disk.' },
    { c: 'CN', q: 'What happens when you type a URL in the browser?', k: 'DNS lookup → TCP handshake (+TLS) → HTTP request → server response → render DOM/CSS/JS.' },
    { c: 'CN', q: 'TCP vs UDP?', k: 'TCP: connection-oriented, reliable, ordered. UDP: connectionless, faster, no guarantees (streaming, DNS, gaming).' },
    { c: 'DSA', q: 'Array vs linked list?', k: 'Array: O(1) index access, costly insert/delete. Linked list: O(1) insert/delete at known node, O(n) access, extra pointer memory.' },
    { c: 'DSA', q: 'How does a HashMap work internally?', k: 'Hash function maps key to a bucket; collisions handled by chaining/open addressing; resize at load factor; O(1) average.' },
    { c: 'DSA', q: 'Explain time vs space complexity with an example.', k: 'Merge sort: O(n log n) time, O(n) space; in-place heap sort: O(n log n) time, O(1) extra space.' },
    { c: 'Web', q: 'Explain REST and common HTTP methods.', k: 'Stateless resource-based API; GET read, POST create, PUT/PATCH update, DELETE remove; use proper status codes.' },
  ];

  D.DECKS = {
    'Core CS': [
      ['What is polymorphism?', 'One interface, many implementations — compile-time (overloading) and run-time (overriding).'],
      ['What is a deadlock?', 'Processes wait on each other in a cycle for resources and none can proceed.'],
      ['Define primary key vs foreign key.', 'Primary key uniquely identifies a row; a foreign key references a primary key in another table.'],
      ['What is a race condition?', 'Outcome depends on unsynchronised timing of concurrent threads accessing shared data.'],
      ['Stack vs heap memory?', 'Stack: automatic, LIFO, fast, per-thread. Heap: dynamic allocation, shared, managed manually/GC.'],
      ['What is Big-O notation?', 'Upper bound on growth rate of time/space as input size grows.'],
      ['What is a REST API?', 'Stateless HTTP interface exposing resources identified by URLs and manipulated with standard methods.'],
      ['What is the difference between == and === in JS?', '== coerces types before comparing; === compares value and type strictly.'],
      ['What is normalization?', 'Organising tables to reduce redundancy and anomalies.'],
      ['TCP three-way handshake?', 'SYN → SYN-ACK → ACK establishes a reliable connection.'],
      ['What is a primary index vs secondary index?', 'Primary index is on the ordering key of the file; secondary index is on a non-ordering attribute.'],
      ['Explain mutex vs semaphore.', 'Mutex: one owner locks/unlocks. Semaphore: a counter allowing N concurrent accessors.'],
    ],
    'HR & Behavioural': [
      ['What does STAR stand for?', 'Situation, Task, Action, Result — a structure for behavioural answers.'],
      ['How long should "Tell me about yourself" be?', '60–90 seconds: present, past, future.'],
      ['How to answer the weakness question?', 'Pick a real, fixable weakness, show actions taken and progress.'],
      ['What to ask the interviewer?', 'Team, learning, expectations, culture, next steps.'],
      ['How to handle a question you do not know?', 'Stay calm, state what you know, reason aloud, and admit gaps honestly.'],
      ['Salary expectation question?', 'Research the range, give a flexible range, and emphasise learning and fit as a fresher.'],
    ],
    'Aptitude Formulas': [
      ['Speed conversion km/h → m/s', 'Multiply by 5/18.'],
      ['Simple interest', 'SI = P × R × T / 100'],
      ['Compound amount', 'A = P (1 + R/100)^T'],
      ['Profit %', '(SP − CP) / CP × 100'],
      ['Work: A in x days, B in y days together', 'xy / (x + y) days'],
      ['Average speed for equal distances at speeds a and b', '2ab / (a + b)'],
      ['Permutations nPr', 'n! / (n − r)!'],
      ['Combinations nCr', 'n! / (r! (n − r)!)'],
    ],
  };
})();
