//Variaveis Globais e funções de apoio geral
jQuery.support.cors = true;
var id = 0;
var rating;
var duration;
var data_lancamento;
var descricao;
var actors;
var categories;
var directors;
var type;
var title;
var pesquisa_ator = '';
var pesquisa_anterior = '';
var pesquisa_diretor = '';
//Funcao pressionar enter
$(document).ready(function () {
	document.getElementById("botao_pesquisar").addEventListener("click", function (event) {
		event.preventDefault()
	});
	$('#pesquisa_input').keypress(function (e) {
		if (e.keyCode == 13) {
			$('#botao_pesquisar').click();
		}
	});
});	
var tamanho_categoria;
//Funcao dados por categoria
function dados_categoria(id){
	$.ajax({
		url: `http://192.168.160.58/netflix/api/Categories/${id}`,
		method: "GET",
		dataType: "json",
		async: false,
		success: function (data) {
			tamanho_categoria = data.Titles.length
		}
	}); 
	return tamanho_categoria
}
console.log(dados_categoria(3))
//Funcoes paginacao
function pagina(){
	$("#all").addClass('d-none')
	$("#filmes_paginados").removeClass('d-none')
}
function menu(){
	$("#all").removeClass('d-none')
	$("#filmes_paginados").addClass('d-none')
}
var pagina_selecionada = 1
$.ajax({
	url: `http://192.168.160.58/netflix/api/Titles?page=${pagina_selecionada}&pagesize=50`,
	method: "GET",
	dataType: "json",
	success: function (data) {
		data.Titles.forEach( function(element) {
			$("#titles").append(`<tr><td>${element.Name}<br>${element.TypeName}</td><td>${element.Description}</td><td>${element.ReleaseYear}</td><tr>`)
		});
	}
});
function proximo(){
	$('td').remove()
	pagina_selecionada += 1
	$.ajax({
		url: `http://192.168.160.58/netflix/api/Titles?page=${pagina_selecionada}&pagesize=50`,
		method: "GET",
		dataType: "json",
		success: function (data) {
			if(data.HasPrevious){
				$(".previous").removeClass('disabled');
			}
			if(data.HasNext == false){
				$(".next").addClass('disabled');
			}
			data.Titles.forEach( function(element) {
				$("#titles").append(`<tr><td>${element.Name}<br>${element.TypeName}</td><td>${element.Description}</td><td>${element.ReleaseYear}</td><tr>`)
			});
		}
	});
}
function anterior(){
	$('td').remove()
	pagina_selecionada -= 1
	$.ajax({
		url: `http://192.168.160.58/netflix/api/Titles?page=${pagina_selecionada}&pagesize=50`,
		method: "GET",
		dataType: "json",
		success: function (data) {
			if(data.HasPrevious){
				$(".previous").removeClass('disabled');
			}else{
				$(".previous").addClass('disabled');
			}
			data.Titles.forEach( function(element) {
				$("#titles").append(`<tr><td>${element.Name}<br>${element.TypeName}</td><td>${element.Description}</td><td>${element.ReleaseYear}</td><tr>`)
			});
		}
	});
}
//Funcao enviar email por AJAX
$("#contato").submit(function (e) {
	var email = $("#email").val()
	var textArea = $("#textArea").val()
	e.preventDefault();
	var form = $(this);
	var url = form.attr('action');
	$.ajax({
		url: url,
		method: "POST",
		dataType: "json",
		data: {
			email: email,
			message: textArea
		},
		success: function (data) {
			$("#alert").removeClass('d-none')
			$("#email").val('')
			$("#textArea").val('')
		}
	});
});
//Função fechar alert de e-mail
function fecharAlert() {
	$("#alert").addClass('d-none')
}
//Função fechar alert de results
function fecharAlert2() {
	$("#alert2").addClass('d-none')
}
//GOOGLE CHARTS CONFIG//
google.charts.load('current', { 'packages': ['corechart'] });
google.charts.setOnLoadCallback(drawChart);
$(window).resize(function () {
	drawChart();
});
var comedia = dados_categoria(3)
var documentario = dados_categoria(13)
var scifi = dados_categoria(11)
var kids = dados_categoria(21)
var acao = dados_categoria(1)
var terror = dados_categoria(9)
var drama = dados_categoria(4)
var romance = dados_categoria(12)
function drawChart() {
	var data = new google.visualization.DataTable();
	data.addColumn('string', 'Topping');
	data.addColumn('number', 'Slices');
	data.addRows([
		['Comédia', comedia],
		['Documentário', documentario],
		['Scifi', scifi],
		['Kids', kids],
		['Ação', acao],
		['Terror', terror],
		['Drama', drama],
		['Romance', romance]
		]);
	var options = {
		'title': 'Os dados das suas Categorias preferidas',
		'width': 360,
		'height': 300,
		is3D: true,
		backgroundColor: { fill: 'transparent' },
		legend: {
			position: 'none', textStyle: { color: 'white', fontSize: 13 }
		}
	};
	var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
	chart.draw(data, options);
}
function chamada(id) {
	$("button").remove(".buttons_pesquisa")
	$.ajax({
		url: `http://192.168.160.58/netflix/api/Titles/${parseInt(id)}`,
		type: 'GET',
		crossDomain: true,
		async: false,
		success: function (res) {
			descricao = res.Description
			data_lancamento = res.ReleaseYear
			duration = res.Duration
			rating = res.Rating.Id
			actors = res.Actors
			directors = res.Directors
			categories = res.Categories
			type = res.Type.Name
			title = res.Name
			$("#title").html(title + '<br>Description')
			$("#body_1").html(descricao)
			$("#body_2").html(data_lancamento)
			$("#body_3").html(duration)
			$("#body_4").html(rating)
			$("#body_5").html(type)
			actors.forEach(element => {
				$("#body_6").html($("#body_6").html() + '<li>' + element.Name + '</li>')
			});
			directors.forEach(element => {
				$("#body_7").html($("#body_7").html() + '<li>' + element.Name + '</li>')
			});
			categories.forEach(element => {
				$("#body_8").html($("#body_8").html() + '<li>' + element.Name + '</li>')
			});
			$.getJSON("https://api.themoviedb.org/3/search/movie?api_key=92f029772ce90437c0b15ee1c2488cf3&query=" + title + "&callback=?", function (json) {
				if ((json != "Nothing found.") || (json.results[0] != undefined)) {
					$('#poster').html('</p><img style="display:block; margin: 0 auto; widht:auto; height:auto;  max-width:300px;" src=\"http://image.tmdb.org/t/p/w500/' + json.results[0].poster_path + '\" class=\"img-responsive\" >');
				}
			})
			$('#pesquisa_input').val('')
		},
	});
	$('#dados').removeClass('d-none');
}
//Função que mostra filmes aleatórios de cada categoria
function show(event) {
	$('#badge_group').html('')
	let id = 0;
	switch (event) {
		case 'comedia':
		id = 3
		break;
		case 'scifi':
		id = 11
		break;
		case 'acao':
		id = 1
		break;
		case 'documentario':
		id = 13
		break;
		case 'drama':
		id = 4
		break;
		case 'terror':
		id = 9
		break;
		case 'romance':
		id = 12
		break;
		case 'anime':
		id = 20
		break;
		case 'kids':
		id = 21
		break;
		case 'suspense':
		id = 10
		break;
	}
	$.ajax({
		url: `http://192.168.160.58/netflix/api/Categories/${id}`,
		type: 'GET',
		crossDomain: true,
		async: false,
	}).done(function (msg) {
		var aleatorio = Math.floor((Math.random() * 100) + 1);
		for (var i = aleatorio; i < aleatorio + 10; i++) {
			var nome_filme = msg.Titles[i].Name;
			$('#badge_group').append(`<span class="badge bg-danger mb-5 botoes_pesquisa" id="badge_1">${nome_filme}</span>`)
		}
	})
}
//Funcao dados gerais da API nos cards
$().ready(function () {
	$.ajax({
		url: `http://192.168.160.58/netflix/api/Statistics`,
		type: 'GET',
		crossDomain: true,
		async: false,
	}).done(function (msg) {
		$('#card_1').html(msg.Titles.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."))
		$('#card_2').html(msg.Actors.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."))
		$('#card_3').html(msg.Directors.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."))
		$('#card_4').html(msg.Countries.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."))
	})
	//Barra de Pesquisa
	var filme_radio = document.getElementById('filme_radio')
	var ator_radio = document.getElementById('ator_radio')
	var diretor_radio = document.getElementById('diretor_radio')
	$('#botao_pesquisar').click(function (event) {
		$("button").remove(".buttons_pesquisa")
		var pesquisa = $('#pesquisa_input').val()
		if (filme_radio.checked) {
			$('#dados').addClass('d-none');
			$('#dados3').addClass('d-none');
			$('#dados2').addClass('d-none');
			$.ajax({
				url: `http://192.168.160.58/netflix/api/Search/Titles?name=${pesquisa}`,
				type: 'GET',
				crossDomain: true,
				async: false,
			}).done(function (msg) {
				var tam = msg.length
				console.log(tam)
				if (tam == 0) {
					$("#alert2").removeClass('d-none')
					$('#pesquisa_input').val('')
				}
				console.log(msg)
				msg.forEach(function (element) {
					var nome_filme_botao = element.Name
					var id_filme = element.Id
					$("#resultado_botao").append(`<button type="button" onclick="chamada(${id_filme})" class="btn btn-danger mt-1 mb-1 buttons_pesquisa">${nome_filme_botao}</button>`)
				});
			})
		}
		if (ator_radio.checked) {
			$('#dados').addClass('d-none');
			$('#dados2').addClass('d-none');
			$('#dados3').addClass('d-none');
			$.ajax({
				url: `http://192.168.160.58/netflix/api/Search/Actors?name=${pesquisa}`,
				type: 'GET',
				crossDomain: true,
				async: false,
			}).done(function (msg) {
				tam = msg.length
				console.log(tam)
				if (tam == 0) {
					$("#alert2").removeClass('d-none')
					$('#pesquisa_input').val('')
				}
				var id_actor = msg[0].Id
				id = id_actor;
			})
			$.ajax({
				url: `http://192.168.160.58/netflix/api/Actors/${parseInt(id)}`,
				type: 'GET',
				crossDomain: true,
				async: false,
				success: function (res) {
					var actors_movies = res.Titles
					var nome_actor = res.Name
					if ((res.Name + ' Movies') != $('#title2').html()) {
						$('#body_9').html('')
						actors_movies.forEach(element => {
							$('#body_9').html($('#body_9').html() + '<li>' + element.Name + '</li>')
							$('#title2').html(res.Name + ' Movies')
						})
					}
					$.getJSON("https://api.themoviedb.org/3/search/person?api_key=92f029772ce90437c0b15ee1c2488cf3&query=" + nome_actor + "&callback=?", function (json) {
						if ((json != "Nothing found.") && (json.results[0].name == res.Name)) {
							$('#poster2').html('</p><img style="display:block; margin: 0 auto; widht:auto; height:auto;  max-width:300px;" src=\"http://image.tmdb.org/t/p/w500/' + json.results[0].profile_path + '\" class=\"img-responsive\" >');
						}
					})
					$('#dados2').removeClass('d-none');
					$('#pesquisa_input').val('')
				}
			})
		}
		if (diretor_radio.checked) {
			$('#dados').addClass('d-none');
			$('#dados3').addClass('d-none');
			$('#dados2').addClass('d-none');
			$.ajax({
				url: `http://192.168.160.58/netflix/api/Search/Directors?name=${pesquisa}`,
				type: 'GET',
				crossDomain: true,
				async: false,
			}).done(function (msg) {
				tam = msg.length
				console.log(tam)
				if (tam == 0) {
					$("#alert2").removeClass('d-none')
					$('#pesquisa_input').val('')
				}
				var id_director = msg[0].Id
				id = id_director;
			})
			$.ajax({
				url: `http://192.168.160.58/netflix/api/Directors/${parseInt(id)}`,
				type: 'GET',
				crossDomain: true,
				async: false,
				success: function (res) {
					var director_movies = res.Titles
					var nome = res.Name
					if ((res.Name + ' Movies') != $('#title3').html()) {
						director_movies.forEach(element => {
							$('#body_10').html($('#body_10').html() + '<li>' + element.Name + '</li>')
							$('#title3').html(res.Name + ' Movies')
						})
						$.getJSON("https://api.themoviedb.org/3/search/person?api_key=92f029772ce90437c0b15ee1c2488cf3&query=" + nome + "&callback=?", function (json) {
							if ((json != "Nothing found.") && (json.results[0].name == res.Name)) {
								$('#poster3').html('</p><img style="display:block; margin: 0 auto; widht:auto; height:auto;  max-width:300px;" src=\"http://image.tmdb.org/t/p/w500/' + json.results[0].profile_path + '\" class=\"img-responsive\" >');
							}
						})
						$('#dados3').removeClass('d-none');
						$('#pesquisa_input').val('')
					}
				}
			})
		}
	})
})