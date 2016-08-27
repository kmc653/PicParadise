function showStatus(msg,delay){
		$('.status').hide().html(msg).fadeIn(200).delay(delay).fadeOut(300);
}

$(function (){
		$(document).on('change', '.uploadPic', function(e){
			var ext = this.value.match(/\.([^\.]+)$/)[1].toLowerCase();
			var permit = ['jpg','gif','png'];
			if(permit.indexOf(ext)>-1){
				showStatus('Ready to Upload !', 600);
			} else {
				showStatus('Your Chosen File Is Not Permitted !! Please pick JPG, GIF or PNG files only !', 4000);
				$(this).val('');
			}
		});
});