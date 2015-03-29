const DEFAULT_COLOR = "#000000";
const SUCCESSFUL_VALIDATION_COLOR = "#00FF00";
const DEFAULT_ZOOM = 15;
const MAIL_PATTERN = /^([a-z0-9_\.-])+@[a-z0-9-]+\.([a-z]{2,4}\.)?[a-z]{2,4}$/i;
var map;

$(document).ready(function() {
    setValidationEvents();
    autocomplete = new google.maps.places.Autocomplete(document.getElementById('adress'));
    autocomplete.setTypes(['address']);
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        $('*[name=adress]').trigger('blur');
        var place = autocomplete.getPlace();
        setDefaultColor();
        if (!place.geometry) {
            return;
        }
        parseResult(place.address_components);
        if (!map){
            map = new google.maps.Map(document.getElementById('map'), {
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                center: place.geometry.location,
                zoom: DEFAULT_ZOOM
            });
        }
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(DEFAULT_ZOOM);
        }
        var marker = new google.maps.Marker({
            map: map,
            anchorPoint: new google.maps.Point(0, -29)
        });

        marker.setIcon(({
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(35, 35)
    }));
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);
    });
});

function setValidationEvents(){
    $('*[name=mail]').blur(function() {
        if(MAIL_PATTERN.test($(this).val()))
            $(this).css('color', SUCCESSFUL_VALIDATION_COLOR);
    });
    $('*[name=mail]').focus(function(){
        $(this).css('color', DEFAULT_COLOR);
        $('#error-field').html("");
    });
    $('input:not(*[name=mail])').focus(function(){
        setDefaultColor();
        $('#error-field').html("");
    });
    $(document).on('submit', validate);
}


function validate(e){
    var mailExists = false;
    var errorText = "Необходимо ввести:" + "\n" + "</br>";
    var error = false;
    if ($('*[name=adress]').is( ":focus" )){
        e.preventDefault();
        return;
    }
    if (document.myform.mail.value == ""){
            error = true;
            errorText += "-e-mail" + "\n" + "</br>";
        } else mailExists = true;
    if (document.myform.adress.value == ""){
            error = true;
            errorText += "-адрес" + "\n" + "</br>";
        }
    if (document.myform.city.value == ""){
            error = true;
            errorText += "-город" + "\n" + "</br>";
        }
    if (document.myform.yourIndex.value == ""){
            error = true;
            errorText += "-индекс" + "\n" + "</br>";
        }
    if (mailExists)
            if(!MAIL_PATTERN.test($('*[name=mail]').val())){
                if (!error) errorText = "";
                error = true;
                errorText += "</br>" + "\n" + "Некорректный e-mail" + "\n" + "</br>";
            }
    if (error){
        $('#error-field').html(errorText);
        e.preventDefault();
    }
}


function parseResult(components){
    var street = "";
    var house = "";
    var adressParts = $('*[name=adress]').val().split(' ');
    var flat = adressParts[adressParts.length - 1];
    var flatRepeated = $('*[name=adress]').val().split(flat);
    for (var i = components.length - 1; i >= 0; i--) {
        if (components[i].types[0] == 'locality'){
             $('*[name=city]').val(components[i].long_name)
                .css('color', SUCCESSFUL_VALIDATION_COLOR);
        }
        if (components[i].types[0] == 'postal_code'){
             $('*[name=yourIndex]').val(components[i].long_name)
                .css('color', SUCCESSFUL_VALIDATION_COLOR);
        }
        $('*[name=adress]').css('color', SUCCESSFUL_VALIDATION_COLOR);
        if (components[i].types[0] == 'route')
            street  = components[i].long_name;
        if (components[i].types[0] == 'street_number')
            house = components[i].long_name; 
    };
    if ((street != "")&&(house != "")){
        if (!isNaN(flat))
            if (flat == house){
                if (flatRepeated.length != 2)
                    $('*[name=adress]').val(street + " " + "д." + house + " " + "кв." + flat);
            }else $('*[name=adress]').val(street + " " + "д." + house + " " + "кв." + flat);
    }
}


function setDefaultColor(){
    $('*[name=adress]').css('color', DEFAULT_COLOR);
    $('*[name=yourIndex]').css('color', DEFAULT_COLOR);
    $('*[name=city]').css('color', DEFAULT_COLOR);
}