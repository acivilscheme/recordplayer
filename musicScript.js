$(document).ready(function(){
    var previousVinyl = "empty";

    //Stops animatiion from being played when page loads
    $("#vinylHolder").css("animation-play-state", "paused");
    $("#turntable").droppable({drop: function(event, ui){

        var audio = document.getElementById("audioFile"); 

        var droppedVinyl = ui.draggable.attr("id");
        
        switch(droppedVinyl)
        {
            case "vinyl1":
                $(".card-text").fadeOut("slow", "linear", function(){$(this).text("Five Leaves Left was recorded between July 1968 and June 1969 at Sound Techniques in London, England. Engineer John Wood recalled that '[Drake] would track live, singing and playing along with the string section without the use of any overdubbing. For the song River Man, producer Joe Boyd described Drake playing on a stool in the center of the studio while surrounded by a semi-circle of instruments. Among his various backing musicians, Drake was accompanied by Richard Thompson from Fairport Convention and Danny Thompson of Pentangle. Robert Kirby, a friend of Drake\'s from his youth, arranged the string instruments for several tracks while Harry Robinson arranged them for River Man.").fadeIn("slow", "linear");});
                $("#audioFile source").attr("src", "media/three hours.mp3");
                break;
            case "vinyl2":
                $(".card-text").fadeOut("slow", "linear", function(){$(this).text("Like Five Leaves Left, the album contained no unaccompanied songs. Drake was accompanied by part of the British folk rock group Fairport Convention and John Cale from The Velvet Underground, as well as Beach Boys musicians Mike Kowalski and Ed Carter. Arranger Robert Kirby claims that Drake intended the instrumentals to evoke Pet Sounds. Initially scheduled for release in November 1970, with UK promotional copies being sent out at the time, dissatisfaction with the artwork meant that the album was held over into the New Year. Mojo called the album 'Certainly the most polished of his catalogue'. Alternative Press called it '[one] of the most beautiful and melancholy albums ever recorded.'").fadeIn("slow", "linear");});
                $("#audioFile source").attr("src", "media/bryter layter.mp3");
                break;
            case "vinyl3":
                $(".card-text").fadeOut("slow", "linear", function(){$(this).text("Drake appeared to have made a decision before recording Pink Moon that it would be as plain as possible and free of numerous guest musicians. In his only interview, published in Sounds magazine in March 1971, Drake told the interviewer that 'for the next [album] I had the idea of just doing something with John Wood, the engineer at Sound Techniques'. The album was recorded in late October 1971 with just Drake and Wood present. The studio was booked during the day, so Drake and Wood arrived around 11:00 p.m and quietly recorded half the songs. The next night, they did the same. In only two late night sessions, with just his voice and acoustic guitar, Drake created what is considered by many to be one of the 'most influential folk albums of all time.'").fadeIn("slow", "linear");});
                $("#audioFile source").attr("src", "media/things behind the sun.mp3");
                break;
            default:
                console.log("Vinyl not recognized!");
        }

        audio.load();
    }});

    $(".vinylPlaceholder").hide();
   
    $(".vinyl").draggable({snap: "#vinylHolder", revert: function(event){
        //if dropped and not in droppable, allow revert
        if(event === false)
        {
            $(this).addClass("vinylPeak");
            $(this).css({"z-index": "9"})
            return true;
        }
        else //if dropped and in droppable don't revert
        {   
            if(previousVinyl != "empty")
            {
                $("#"+previousVinyl).show();
                $("#"+previousVinyl).css({"top": "0", "left": "0", "z-index": "9"});
                $("#"+previousVinyl).addClass("vinylPeak");
                $("#"+previousVinyl).siblings(".vinylPlaceholder").hide();
            }

            previousVinyl = $(this).attr("id");
           
            $("#vinylHolder").children("img").attr("src", $(this).children("img").attr("src"));
            $(this).hide();
            $(this).siblings(".vinylPlaceholder").show();
            return false;
        }
    }});

    //Hoover if vinyl has vinylpeak class
    $(".album").hover(function(){
        $(this).children(".vinyl.vinylPeak").css({"top": "auto", "left": "auto"});
        $(this).children(".vinyl.vinylPeak").finish().animate({right: "-75px"}, "slow");
    }, function(){
        $(this).children(".vinyl.vinylPeak").finish().animate({right: "0px"}, "slow");
    });

    //when clicked, remove peaking animation
    $(".album").click(function(){
        $(this).children(".vinyl").finish().animate({right: "0"}, "fast");
        $(this).children(".vinyl").css("z-index", "11");
        $(this).children(".vinyl").removeClass("vinylPeak");
    });

    //Math for determining when arm is in record
    var dragging = false;
 
    //Finding center and radius of turntable
    var turntableCenterX = ($("#turntable").width() / 2) + $("#turntable").offset().left;
    var turntableCenterY = ($("#turntable").height() / 2) + $("#turntable").offset().top;
    var turntableRadius = $("#turntable").width() / 2;

    //Origin point where rotating arm, using container since doesnt change
    var armLeft = $("#turntableArmContainer").offset().left;
    var armTop = $("#turntableArmContainer").offset().top;
    var armOriginX = ($("#turntableArmContainer").width() * .5) + armLeft;
    var armOriginY = ($("#turntableArmContainer").height() * .15) + armTop;

    var currentAngle = 0;
    
    //Store needle box coordinates
    var needleCoords = $("#armClickPoint").get(0).getBoundingClientRect();

    //Calculating bounding box points of needle taking scroll adjustments into account
    var needleTop = needleCoords.top + $(this).scrollTop();
    var needleLeft = needleCoords.left;
    var needleBottom = needleCoords.bottom + $(this).scrollTop();
    var needleRight = needleCoords.right - 10; //moving point closer to image

    //Needle TopLeft and BottomRight X and Y coordinates
    var nTopLeftX, nTopLeftY, nBottomRightX, nBottomRightY;

    //Recalculating points on resize
    $(window).resize(function(){
        //Turntable center
        turntableCenterX = ($("#turntable").width() / 2) + $("#turntable").offset().left;
        turntableCenterY = ($("#turntable").height() / 2) + $("#turntable").offset().top;

        //Arm
        armLeft = $("#turntableArmContainer").offset().left;
        armTop = $("#turntableArmContainer").offset().top;

        armOriginX = ($("#turntableArmContainer").width() * .5) + armLeft;
        armOriginY = ($("#turntableArmContainer").height() * .15) + armTop;

        //Bottom right of needle based upon arm container position
        var tArm = $("#turntableArmContainer").get(0).getBoundingClientRect();
        needleBottom = tArm.bottom + $(this).scrollTop();
        needleRight = tArm.right - 25; //moving point closer to image
        nBottomRightX = newX2(needleRight, needleBottom, armOriginX, armOriginY, currentAngle);
        nBottomRightY = newY2(needleRight, needleBottom, armOriginX, armOriginY, currentAngle);
    });


    $("#armClickPoint").mousedown(function(e){
        //Prepare for dragging
        dragging = true;
    });

    $(document).mouseup(function(e){
        dragging = false;

        //Checking if points of arm bounding box is in the area of the record
        //Should only need bottom right point
        // var topLeftInCircle = isInCircle(nTopLeftX, nTopLeftY, turntableCenterX, turntableCenterY, turntableRadius);
        // var topRightInCircle = isInCircle(nBottomRightX, nTopLeftY, turntableCenterX, turntableCenterY, turntableRadius);
        // var bottomLeftInCircle = isInCircle(nTopLeftX, nBottomRightY, turntableCenterX, turntableCenterY, turntableRadius);
        var bottomRightInCircle = isInCircle(nBottomRightX, nBottomRightY, turntableCenterX, turntableCenterY, turntableRadius);
        
        var audio = document.getElementById("audioFile"); 
        //if(topLeftInCircle || topRightInCircle || bottomLeftInCircle || bottomRightInCircle)
        //if(topLeftInCircle && bottomRightInCircle)
        if(bottomRightInCircle && (previousVinyl != "empty"))
        {
            $("#vinylHolder").css("animation-play-state", "running");
            audio.play();
        }
        else if(previousVinyl != "empty")
        {
            $("#vinylHolder").css("animation-play-state", "paused");
            audio.pause();
        }
    });

    $(document).mousemove(function(e){
        if(dragging){
            var mouseX = e.pageX;
            var mouseY = e.pageY;

            //Calculating angle from origin to mouse
            var radians = Math.atan2((mouseX-armOriginX), (mouseY-armOriginY));
            var degrees	= Math.round(radians * (180 / Math.PI) * -1);

            //Restricting arm movement
            if(degrees < 0)
            {
                degrees = 0;
            }
            else if(degrees > 50)
            {
                degrees = 50;
            }
            currentAngle = degrees;

            $("#turntableArm").css("transform", "rotate("+degrees+"deg)");
            
            //New Points based on angle, should only need bottom right point
            // nTopLeftX = newX2(needleLeft, needleTop, armOriginX, armOriginY, currentAngle);
            // nTopLeftY = newY2(needleLeft, needleTop, armOriginX, armOriginY, currentAngle);
            nBottomRightX = newX2(needleRight, needleBottom, armOriginX, armOriginY, currentAngle);
            nBottomRightY = newY2(needleRight, needleBottom, armOriginX, armOriginY, currentAngle);
        }
    });
});

//Check if point is in the circle with center x,y and radius
function isInCircle(pointX, pointY, centerX, centerY, radius)
{
    if(Math.pow((pointX - centerX), 2) + Math.pow((pointY - centerY), 2) < Math.pow(radius, 2))
    {
        return true;
    }
    else
    {
        return false;
    }
}

//Calculate new point based upon angle origin 0,0
function newX(pointX, pointY, angle)
{
    var rad = angle * (Math.PI / 180) * -1;
    var xpoint = pointX * Math.cos(rad) + pointY * Math.sin(rad);
    return xpoint;
}

//Calculate new point based upon angle origin 0,0
function newY(pointX, pointY, angle)
{
    var rad = angle * (Math.PI / 180) * -1;
    var ypoint = -pointX * Math.sin(rad) + pointY * Math.cos(rad);
    return ypoint;
}

//Calculate new point based on initial position where origin is not 0,0
function newX2(pointX, pointY, oX, oY, angle)
{
    //Convert from degrees to radians
    var rad = angle * (Math.PI / 180);
    var xpoint = ((pointX-oX) * Math.cos(rad)) - ((pointY-oY) * Math.sin(rad)) + oX;

    return xpoint;
}

//Calculate new point based on initial position where origin is not 0,0
function newY2(pointX, pointY, oX, oY, angle)
{
    //Convert from degrees to radians
    var rad = angle * (Math.PI / 180);
    var ypoint = ((pointX-oX) * Math.sin(rad)) + ((pointY-oY) * Math.cos(rad)) + oY;
    
    return ypoint;
}