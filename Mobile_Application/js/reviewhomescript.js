$('#addButtonName').click(function() {
    var thediv = $('#addMoreButtons');
	var buttonValue = $('#newFactorValue');
    var buttonName= $('#newButtonName');
   
	
    if(buttonName.val() != '') {
        thediv.prepend('<div id="'+buttonName.val()+ '"data-role="header" class="ui-header ui-bar-a" role="banner"><a href="#"  onclick="removeel('+"'#"+buttonName.val()+"'"+ ')"data-icon="delete" class="ui-btn-right ui-btn ui-btn-up-a ui-shadow ui-btn-corner-all ui-btn-icon-left" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="a"><span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">Cancel</span><span class="ui-icon ui-icon-delete ui-icon-shadow">&nbsp;</span></span></a><h3 class="ui-title" role="heading" aria-level="1">'+buttonName.val()+'</h3> <input data-theme="c" type="text" name="'+buttonName.val()+'" id="" value="'+buttonValue.val()+'" /> </div>');
        buttonName.val('');
		buttonValue.val('');
        $('#reviewhomesform').trigger('create');  
		
    }
});



 
function removeel(ids) {
     
		$(ids).remove();

    
}

