# Add touch swipe gestures to ImageCarousel for mobile users

<div><b><h1>Add touch swipe gestures to ImageCarousel for mobile users</h1></b></div>
<div><b><span style="font-size: 13px"><h2>038-add-touch-swipe-gestures-to-imagecarousel-for-mobiPlanning</h2></span></b><b><h2><br></h2></b></div>
<div><h2><br></h2></div>
<div><h2><br></h2></div>
<div><h2>Close</h2></div>
<div><font face=".AppleSystemUIFont"><span style="font-size: 13px"><h2>OverviewSubtasks (0)LogsFiles</h2></span></font><b><h2><br></h2></b></div>
<div><b><br></b></div>
<div><b>UI/UXUI/UX Improvements</b><br></div>
<div><br></div>
<div>Created</div>
<div> </div>
<div>3h ago</div>
<div>•</div>
<div>Updated 3h ago</div>
<div>Implement touch swipe left/right gestures for ImageCarousel on mobile devices, allowing users to navigate images naturally with finger swipes.</div>
<div><br></div>
<div>RATIONALE</div>
<div>Mobile users expect to swipe through image galleries. Currently, the ImageCarousel requires tapping small arrow buttons which can be difficult on mobile. Swipe gestures are the standard mobile interaction pattern for carousels.</div>
<div><br></div>
<div>PROBLEM SOLVED</div>
<div>The ImageCarousel only supports click-based navigation via prev/next buttons. On mobile devices, users must tap small buttons (32x32px touch targets). There are no touch/swipe event handlers. The component doesn't detect touch start/end positions.</div>
<div><br></div>
<div><font face=".AppleSystemUIFont"><span style="font-size: 13px"><h2>AFFECTED FILES</h2></span></font><b><span style="font-size: 13px"><h2>ImageCarousel.tsx</h2></span></b><b><h2><br></h2></b></div>
<div><br></div>
<div><br></div>
<div><br></div>
<div><b><h1>Aplicar rate limiting nas actions de autenticação</h1></b></div>
<div><b><h2>037-aplicar-rate-limiting-nas-actions-de-autentica-oPlanning</h2></b></div>
<div><h2><br></h2></div>
<div><h2><br></h2></div>
<div><h2>Close</h2></div>
<div><b><h2>OverviewSubtasks (0)LogsFiles</h2></b></div>
<div><b><h2><br></h2></b></div>
<div><b><h2>SecurityHighHigh Impact</h2></b></div>
<div><b><h2><br></h2></b></div>
<div><b>highSecurity</b></div>
<div><b><br></b></div>
<div><b>Created</b></div>
<div><b> </b></div>
<div><b>3h ago</b></div>
<div><h2>•</h2></div>
<div><h2>Updated 3h ago</h2></div>
<div>O sistema possui infraestrutura de rate limiting em src/lib/security/rate-limit.ts com configurações específicas para login (5/min) e signup (3/min), porém essas verificações não estão sendo aplicadas nas Server Actions de autenticação em src/actions/auth.ts. As funções login(), register() e resetPassword() podem ser chamadas sem limite.</div>
<div><b><br></b></div>
<div><b>RATIONALE</b></div>
<div><h2>Endpoints de autenticação são alvos primários para ataques de brute force e credential stuffing. Sem rate limiting aplicado, atacantes podem fazer milhares de tentativas de login por minuto para descobrir senhas ou enumerar usuários válidos.</h2></div>

